/**
 * Release script: pre-flight checks, version bump, commit, tag, push.
 * Usage: deno run -A scripts/release.ts patch|minor [--dry-run] [--no-push] [--skip-tests] [--skip-lint]
 */
import semver from "npm:semver@^7.6.3";

const PACKAGE_JSON = "package.json";
const TAURI_CONF = "src-tauri/tauri.conf.json";
const CARGO_TOML = "src-tauri/Cargo.toml";

type BumpType = "patch" | "minor";

interface Options {
  bump: BumpType;
  dryRun: boolean;
  noPush: boolean;
  skipTests: boolean;
  skipLint: boolean;
  releaseBranch: string;
}

type CheckResult = { ok: boolean; message?: string };

function parseArgs(): Options {
  const args = Deno.args.filter((a) => !a.startsWith("--"));
  const flags = new Set(Deno.args.filter((a) => a.startsWith("--")));
  const bump = args[0] === "minor" ? "minor" : "patch";
  const releaseBranch = Deno.env.get("RELEASE_BRANCH") ?? "master";
  return {
    bump,
    dryRun: flags.has("--dry-run"),
    noPush: flags.has("--no-push"),
    skipTests: flags.has("--skip-tests"),
    skipLint: flags.has("--skip-lint"),
    releaseBranch,
  };
}

async function runGit(
  args: string[],
  options?: { cwd?: string },
): Promise<{ code: number; stdout: string; stderr: string }> {
  const cmd = new Deno.Command("git", {
    args,
    cwd: options?.cwd ?? Deno.cwd(),
    stdout: "piped",
    stderr: "piped",
  });
  const output = await cmd.output();
  const decoder = new TextDecoder();
  return {
    code: output.code,
    stdout: decoder.decode(output.stdout).trim(),
    stderr: decoder.decode(output.stderr).trim(),
  };
}

async function runTask(
  taskName: string,
): Promise<{ code: number; stdout: string; stderr: string }> {
  const cmd = new Deno.Command("deno", {
    args: ["task", taskName],
    stdout: "piped",
    stderr: "piped",
  });
  const output = await cmd.output();
  const decoder = new TextDecoder();
  return {
    code: output.code,
    stdout: decoder.decode(output.stdout).trim(),
    stderr: decoder.decode(output.stderr).trim(),
  };
}

async function readPackageVersion(): Promise<string> {
  const text = await Deno.readTextFile(PACKAGE_JSON);
  const pkg = JSON.parse(text) as { version?: string };
  if (typeof pkg.version !== "string") {
    throw new Error("package.json has no version field");
  }
  return pkg.version;
}

async function getVersionFromTauriConf(): Promise<string> {
  const text = await Deno.readTextFile(TAURI_CONF);
  const obj = JSON.parse(text) as { version?: string };
  return obj.version ?? "";
}

async function getVersionFromCargoToml(): Promise<string> {
  const text = await Deno.readTextFile(CARGO_TOML);
  const match = text.match(/version\s*=\s*"([^"]*)"/);
  return match?.[1] ?? "";
}

function fail(message: string): never {
  console.error(message);
  Deno.exit(1);
}

async function check(
  name: string,
  fn: () => Promise<CheckResult>,
): Promise<void> {
  const result = await fn();
  if (!result.ok) {
    fail(
      `Check failed: ${name}${result.message ? ` — ${result.message}` : ""}`,
    );
  }
}

// --- Git state checks ---

async function checkWorkingTreeClean(): Promise<CheckResult> {
  const { stdout } = await runGit(["status", "--porcelain"]);
  if (stdout) {
    return { ok: false, message: "Working tree has uncommitted changes" };
  }
  return { ok: true };
}

async function checkNotDetachedHead(): Promise<CheckResult> {
  const { stdout } = await runGit(["symbolic-ref", "-q", "HEAD"]);
  if (stdout === "") {
    return { ok: false, message: "Detached HEAD; must be on a branch" };
  }
  return { ok: true };
}

async function checkNoMergeRebaseInProgress(): Promise<CheckResult> {
  const mergeHead = await Deno.stat(".git/MERGE_HEAD").catch(() => null);
  const rebaseMerge = await Deno.stat(".git/rebase-merge").catch(() => null);
  const rebaseApply = await Deno.stat(".git/rebase-apply").catch(() => null);
  if (mergeHead?.isFile) return { ok: false, message: "Merge in progress" };
  if (rebaseMerge?.isDirectory)
    return { ok: false, message: "Rebase in progress" };
  if (rebaseApply?.isDirectory)
    return { ok: false, message: "Rebase in progress" };
  return { ok: true };
}

async function checkOnReleaseBranch(branch: string): Promise<CheckResult> {
  const { stdout } = await runGit(["branch", "--show-current"]);
  if (stdout.trim() !== branch) {
    return {
      ok: false,
      message: `Must be on ${branch}, currently on ${stdout.trim() || "unknown"}`,
    };
  }
  return { ok: true };
}

async function checkGitUserConfigured(): Promise<CheckResult> {
  const { stdout: name } = await runGit(["config", "user.name"]);
  const { stdout: email } = await runGit(["config", "user.email"]);
  if (!name.trim()) return { ok: false, message: "git user.name not set" };
  if (!email.trim()) return { ok: false, message: "git user.email not set" };
  return { ok: true };
}

// --- Remote and sync checks ---

async function checkRemoteOriginExists(): Promise<CheckResult> {
  const { stdout } = await runGit(["remote", "get-url", "origin"]);
  if (!stdout) {
    return { ok: false, message: "Remote 'origin' not configured" };
  }
  return { ok: true };
}

async function checkRemoteHasBranch(branch: string): Promise<CheckResult> {
  const { code } = await runGit(["ls-remote", "--heads", "origin", branch]);
  if (code !== 0) {
    return { ok: false, message: `Could not check if origin/${branch} exists` };
  }
  const { stdout } = await runGit(["ls-remote", "--heads", "origin", branch]);
  if (!stdout.trim()) {
    return { ok: false, message: `Remote does not have branch ${branch}` };
  }
  return { ok: true };
}

async function getRemoteLatestTag(): Promise<string | null> {
  const { stdout } = await runGit(["ls-remote", "--tags", "origin"]);
  const lines = stdout.trim().split("\n").filter(Boolean);
  const tags = lines
    .map((line) => {
      const ref = line.split(/\s+/)[1];
      const match = ref?.match(/refs\/tags\/(v[\d.]+)(?:\^{})?$/);
      return match ? match[1] : null;
    })
    .filter((t): t is string => t !== null);
  const versions = tags
    .map((t) => t.replace(/^v/, ""))
    .filter((v) => semver.valid(v))
    .sort(semver.rcompare);
  return versions[0] ? `v${versions[0]}` : null;
}

async function checkLocalMatchesRemote(
  localVersion: string,
): Promise<CheckResult> {
  await runGit(["fetch", "origin"]);
  const remoteTag = await getRemoteLatestTag();
  const expectedTag = `v${localVersion}`;
  if (!remoteTag) {
    // No remote tags yet - first release
    return { ok: true };
  }
  if (remoteTag !== expectedTag) {
    return {
      ok: false,
      message: `Local version ${localVersion} does not match remote latest tag ${remoteTag}. Ensure you're in sync before releasing.`,
    };
  }
  return { ok: true };
}

async function checkLocalNotBehindRemote(branch: string): Promise<CheckResult> {
  const { stdout: behindCount } = await runGit([
    "rev-list",
    "--count",
    `HEAD..origin/${branch}`,
  ]);
  if (parseInt(behindCount, 10) > 0) {
    return {
      ok: false,
      message: `Local branch is behind origin/${branch}; pull first`,
    };
  }
  return { ok: true };
}

async function checkCanPush(branch: string): Promise<CheckResult> {
  const { code, stderr } = await runGit([
    "push",
    "--dry-run",
    "origin",
    branch,
  ]);
  if (code !== 0) {
    return { ok: false, message: stderr || "git push --dry-run failed" };
  }
  return { ok: true };
}

// --- Version consistency checks ---

async function checkVersionsInSync(): Promise<CheckResult> {
  const pkg = await readPackageVersion();
  const tauri = await getVersionFromTauriConf();
  const cargo = await getVersionFromCargoToml();
  if (pkg !== tauri || pkg !== cargo) {
    return {
      ok: false,
      message: `Versions out of sync: package.json=${pkg}, tauri.conf.json=${tauri}, Cargo.toml=${cargo}`,
    };
  }
  return { ok: true };
}

async function checkTagDoesNotExistLocally(tag: string): Promise<CheckResult> {
  const { stdout } = await runGit(["tag", "-l", tag]);
  if (stdout.trim() === tag) {
    return { ok: false, message: `Tag ${tag} already exists locally` };
  }
  return { ok: true };
}

async function checkTagDoesNotExistOnRemote(tag: string): Promise<CheckResult> {
  const { stdout } = await runGit(["ls-remote", "origin", `refs/tags/${tag}`]);
  if (stdout.trim()) {
    return { ok: false, message: `Tag ${tag} already exists on remote` };
  }
  return { ok: true };
}

function checkValidSemver(version: string): CheckResult {
  if (!semver.valid(version)) {
    return { ok: false, message: `Invalid semver: ${version}` };
  }
  return { ok: true };
}

// --- Shallow clone ---

async function checkNotShallow(): Promise<CheckResult> {
  const { stdout } = await runGit(["rev-parse", "--is-shallow-repository"]);
  if (stdout.trim() === "true") {
    return {
      ok: false,
      message: "Shallow clone detected; full history may be unavailable",
    };
  }
  return { ok: true };
}

// --- Build and quality ---

async function runTests(): Promise<CheckResult> {
  const { code, stdout, stderr } = await runTask("test");
  if (code !== 0) {
    return { ok: false, message: `Tests failed:\n${stderr || stdout}` };
  }
  return { ok: true };
}

async function runLint(): Promise<CheckResult> {
  const eslint = await runTask("eslint");
  if (eslint.code !== 0) {
    return {
      ok: false,
      message: `ESLint failed:\n${eslint.stderr || eslint.stdout}`,
    };
  }
  const prettier = await runTask("prettier-lint");
  if (prettier.code !== 0) {
    return {
      ok: false,
      message: `Prettier check failed:\n${prettier.stderr || prettier.stdout}`,
    };
  }
  return { ok: true };
}

// --- Main ---

async function main(): Promise<void> {
  const opts = parseArgs();
  const currentVersion = await readPackageVersion();
  const nextVersion =
    opts.bump === "patch"
      ? semver.inc(currentVersion, "patch")!
      : semver.inc(currentVersion, "minor")!;
  const tagName = `v${nextVersion}`;

  console.log(`Release ${tagName} (${opts.bump} bump from ${currentVersion})`);
  if (opts.dryRun) console.log("Dry run: checks only, no changes");
  if (opts.noPush) console.log("No push: tag locally only");
  if (opts.skipTests) console.log("Skipping tests");
  if (opts.skipLint) console.log("Skipping lint");
  console.log("");

  // 1. Git repository state
  await check("Working tree clean", checkWorkingTreeClean);
  await check("Not detached HEAD", checkNotDetachedHead);
  await check("No merge/rebase in progress", checkNoMergeRebaseInProgress);
  await check("On release branch", () =>
    checkOnReleaseBranch(opts.releaseBranch),
  );
  await check("Git user configured", checkGitUserConfigured);

  // 2. Remote and sync
  await check("Remote origin exists", checkRemoteOriginExists);
  await check("Remote has release branch", () =>
    checkRemoteHasBranch(opts.releaseBranch),
  );
  await check("Local matches remote", () =>
    checkLocalMatchesRemote(currentVersion),
  );
  await check("Local not behind remote", () =>
    checkLocalNotBehindRemote(opts.releaseBranch),
  );
  await check("Can push", () => checkCanPush(opts.releaseBranch));

  // 3. Version consistency
  await check("Versions in sync", checkVersionsInSync);
  await check("Valid semver", () =>
    Promise.resolve(checkValidSemver(currentVersion)),
  );
  await check("Target tag does not exist locally", () =>
    checkTagDoesNotExistLocally(tagName),
  );
  await check("Target tag does not exist on remote", () =>
    checkTagDoesNotExistOnRemote(tagName),
  );

  // 4. Shallow clone
  await check("Not shallow repository", checkNotShallow);

  // 5. Build and quality
  if (!opts.skipTests) {
    console.log("Running tests...");
    await check("Tests pass", runTests);
  }
  if (!opts.skipLint) {
    console.log("Running lint...");
    await check("Lint passes", runLint);
  }

  console.log("All checks passed.\n");

  if (opts.dryRun) {
    console.log("Dry run complete. No changes made.");
    Deno.exit(0);
  }

  // Version bump (includes cargo build)
  console.log(`Bumping version to ${nextVersion}...`);
  const bumpCmd = new Deno.Command("deno", {
    args: ["run", "-A", "scripts/version.ts", opts.bump],
    stdout: "inherit",
    stderr: "inherit",
  });
  const bumpResult = await bumpCmd.output();
  if (bumpResult.code !== 0) fail("Version bump failed");

  // Commit
  const filesToAdd = [
    "package.json",
    "src-tauri/tauri.conf.json",
    "src-tauri/Cargo.toml",
    "src-tauri/Cargo.lock",
  ];
  await runGit(["add", ...filesToAdd]);
  const { code: commitCode, stderr: commitStderr } = await runGit([
    "commit",
    "-m",
    `Release ${tagName}`,
  ]);
  if (commitCode !== 0) {
    fail(`Commit failed: ${commitStderr}`);
  }
  console.log(`Committed release ${tagName}`);

  // Tag
  await runGit(["tag", tagName]);
  console.log(`Tagged ${tagName}`);

  if (opts.noPush) {
    console.log(
      "\nDone. Tag created locally. Run `git push origin " +
        opts.releaseBranch +
        " --tags` when ready.",
    );
    Deno.exit(0);
  }

  // Push
  const { code: pushCode, stderr: pushStderr } = await runGit([
    "push",
    "origin",
    opts.releaseBranch,
    "--tags",
  ]);
  if (pushCode !== 0) {
    fail(`Push failed: ${pushStderr}`);
  }
  console.log(`\nPushed ${opts.releaseBranch} and ${tagName}`);
  console.log("Find the release on GitHub and mark it as 'latest'.");
}

main()
  .then(() => Deno.exit(0))
  .catch((err) => {
    console.error(err);
    Deno.exit(1);
  });
