/**
 * Release script: pre-flight checks, version bump, commit, tag, push.
 * Usage: deno run -A scripts/release.ts patch|minor [--dry-run] [--no-push] [--skip-tests] [--skip-lint] [--yes]
 * When run interactively (TTY), you must type "release" or the version tag to confirm. Use --yes to skip (e.g. in CI or with yes release |).
 */
import semver from "npm:semver@7.7.1";

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
  yes: boolean;
  releaseBranch: string;
}

type CheckResult = { ok: boolean; message?: string };

type NamedCheck = {
  name: string;
  fn: () => Promise<CheckResult>;
};

type FailedCheck = {
  name: string;
  message?: string;
};

function isFailedCheck(
  value: { name: string; message?: string } | null,
): value is FailedCheck {
  return value !== null;
}

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
    yes: flags.has("--yes"),
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

/** Read one line from stdin (trimmed). */
async function readLine(): Promise<string> {
  const buf = new Uint8Array(1024);
  let result = "";
  while (true) {
    const n = await Deno.stdin.read(buf);
    if (n === null || n === 0) break;
    const chunk = new TextDecoder().decode(buf.subarray(0, n));
    result += chunk;
    if (chunk.includes("\n")) break;
  }
  return result.split("\n")[0].trim();
}

/** Require confirmation before proceeding with the release. TTY: prompt for "release" or tag; non-TTY: require --yes. */
async function confirmRelease(tagName: string, opts: Options): Promise<void> {
  const isTty = Deno.stdin.isTerminal();
  if (isTty) {
    console.log(`About to release ${tagName}. Type "release" or "${tagName}" to continue, or Ctrl+C to cancel.`);
    const input = await readLine();
    const ok =
      input.toLowerCase() === "release" || input === tagName;
    if (!ok) {
      fail(
        `Confirmation failed (expected "release" or "${tagName}"). No changes made.`,
      );
    }
    return;
  }
  if (!opts.yes) {
    fail(
      "Non-interactive (no TTY) and --yes not set. Run with --yes to proceed (e.g. in CI), or run in a TTY to be prompted. No changes made.",
    );
  }
}

function formatFailures(failures: FailedCheck[]): string {
  const lines = failures.map((f) =>
    `- ${f.name}${f.message ? ` — ${f.message}` : ""}`
  );
  return lines.join("\n");
}

async function runChecksParallel(checks: NamedCheck[]): Promise<FailedCheck[]> {
  const results = await Promise.all(
    checks.map(async (c) => {
      try {
        const r = await c.fn();
        if (r.ok) return null;
        return typeof r.message === "string"
          ? { name: c.name, message: r.message }
          : { name: c.name };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { name: c.name, message };
      }
    }),
  );
  return results.filter(isFailedCheck);
}

async function runTasksParallel(
  tasks: { name: string; taskName: string }[],
): Promise<FailedCheck[]> {
  const results = await Promise.all(
    tasks.map(async (t) => {
      const res = await runTask(t.taskName);
      if (res.code === 0) return null;
      const output = res.stderr || res.stdout || "";
      return output
        ? { name: t.name, message: `${t.taskName} failed:\n${output}` }
        : { name: t.name };
    }),
  );
  return results.filter(isFailedCheck);
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
  const { code, stdout, stderr } = await runGit([
    "ls-remote",
    "--heads",
    "origin",
    branch,
  ]);
  if (code !== 0) {
    return {
      ok: false,
      message: stderr || `Could not check if origin/${branch} exists`,
    };
  }
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
  const [pkg, tauri, cargo] = await Promise.all([
    readPackageVersion(),
    getVersionFromTauriConf(),
    getVersionFromCargoToml(),
  ]);
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
  if (opts.yes) console.log("Yes: skipping confirmation prompt");
  if (opts.skipTests) console.log("Skipping tests");
  if (opts.skipLint) console.log("Skipping lint");
  console.log("");

  const failures: FailedCheck[] = [];

  // 1) Local checks (parallel)
  console.log("Running local checks...");
  failures.push(
    ...await runChecksParallel([
      { name: "Working tree clean", fn: checkWorkingTreeClean },
      { name: "Not detached HEAD", fn: checkNotDetachedHead },
      { name: "No merge/rebase in progress", fn: checkNoMergeRebaseInProgress },
      {
        name: "On release branch",
        fn: () => checkOnReleaseBranch(opts.releaseBranch),
      },
      { name: "Git user configured", fn: checkGitUserConfigured },
      { name: "Not shallow repository", fn: checkNotShallow },
      { name: "Versions in sync", fn: checkVersionsInSync },
      {
        name: "Valid semver",
        fn: () => Promise.resolve(checkValidSemver(currentVersion)),
      },
      {
        name: "Target tag does not exist locally",
        fn: () => checkTagDoesNotExistLocally(tagName),
      },
    ]),
  );

  // 2) Remote checks (fetch once, then parallel)
  console.log("Running remote checks...");
  failures.push(
    ...await runChecksParallel([
      { name: "Remote origin exists", fn: checkRemoteOriginExists },
    ]),
  );

  if (failures.length === 0) {
    const fetchRes = await runGit(["fetch", "origin"]);
    if (fetchRes.code !== 0) {
      failures.push({
        name: "Fetch origin",
        message: fetchRes.stderr || fetchRes.stdout || "git fetch origin failed",
      });
    }
  }

  if (failures.length === 0) {
    const remoteChecks: NamedCheck[] = [
      {
        name: "Remote has release branch",
        fn: () => checkRemoteHasBranch(opts.releaseBranch),
      },
      {
        name: "Local matches remote",
        fn: () => checkLocalMatchesRemote(currentVersion),
      },
      {
        name: "Local not behind remote",
        fn: () => checkLocalNotBehindRemote(opts.releaseBranch),
      },
    ];
    if (!opts.noPush) {
      remoteChecks.push(
        { name: "Can push", fn: () => checkCanPush(opts.releaseBranch) },
        {
          name: "Target tag does not exist on remote",
          fn: () => checkTagDoesNotExistOnRemote(tagName),
        },
      );
    }
    failures.push(...await runChecksParallel(remoteChecks));
  }

  // 3) Quality tasks (parallel by default)
  const qualityTasks: { name: string; taskName: string }[] = [];
  if (!opts.skipTests) qualityTasks.push({ name: "Tests pass", taskName: "test" });
  if (!opts.skipLint) {
    qualityTasks.push(
      { name: "ESLint passes", taskName: "eslint" },
      { name: "Prettier check passes", taskName: "prettier-lint" },
    );
  }

  if (qualityTasks.length) {
    console.log("Running quality tasks...");
    failures.push(...await runTasksParallel(qualityTasks));
  }

  if (failures.length) {
    fail(`Checks failed:\n${formatFailures(failures)}`);
  }

  console.log("All checks passed.\n");

  if (opts.dryRun) {
    console.log("Dry run complete. No changes made.");
    Deno.exit(0);
  }

  await confirmRelease(tagName, opts);

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
