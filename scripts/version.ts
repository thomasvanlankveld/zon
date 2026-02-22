/**
 * Version bump and sync: single source of truth is package.json.
 * Usage: deno run -A scripts/version.ts [sync|patch|minor] [--no-build]
 * - sync: only sync package.json version to tauri.conf.json and Cargo.toml
 * - patch | minor: bump in package.json then sync
 * - --no-build: skip running cargo build (default is to run it to refresh Cargo.lock)
 */
import semver from "npm:semver@^7.6.3";

// Paths relative to repo root (cwd when run via npm scripts)
const PACKAGE_JSON = "package.json";
const TAURI_CONF = "src-tauri/tauri.conf.json";
const CARGO_TOML = "src-tauri/Cargo.toml";

type Command = "sync" | "patch" | "minor";

function parseArgs(): { cmd: Command; noBuild: boolean } {
  const args = Deno.args.filter((a) => a !== "--no-build");
  const noBuild = Deno.args.includes("--no-build");
  const arg = args[0];
  const cmd: Command = arg === "patch" || arg === "minor" || arg === "sync" ? arg : "sync";
  return { cmd, noBuild };
}

async function readVersion(): Promise<string> {
  const text = await Deno.readTextFile(PACKAGE_JSON);
  const pkg = JSON.parse(text) as { version?: string };
  if (typeof pkg.version !== "string") {
    throw new Error("package.json has no version field");
  }
  return pkg.version;
}

function bump(version: string, cmd: "patch" | "minor"): string {
  const next = cmd === "patch" ? semver.inc(version, "patch") : semver.inc(version, "minor");
  if (!next) throw new Error(`Invalid semver or bump failed: ${version}`);
  return next;
}

async function writePackageJsonVersion(version: string): Promise<void> {
  const text = await Deno.readTextFile(PACKAGE_JSON);
  const pkg = JSON.parse(text) as { version?: string };
  pkg.version = version;
  await Deno.writeTextFile(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + "\n");
}

async function syncTauriConf(version: string): Promise<void> {
  const text = await Deno.readTextFile(TAURI_CONF);
  const obj = JSON.parse(text) as { version?: string };
  obj.version = version;
  await Deno.writeTextFile(TAURI_CONF, JSON.stringify(obj, null, 2) + "\n");
}

async function syncCargoToml(version: string): Promise<void> {
  const text = await Deno.readTextFile(CARGO_TOML);
  const match = text.match(/version\s*=\s*"[^"]*"/);
  if (!match) throw new Error("Could not find [package] version in Cargo.toml");
  const replaced = text.replace(match[0], `version = "${version}"`);
  await Deno.writeTextFile(CARGO_TOML, replaced);
}

async function runCargoBuild(): Promise<void> {
  const command = new Deno.Command("cargo", {
    args: ["build", "--manifest-path", "src-tauri/Cargo.toml"],
    stdout: "piped",
    stderr: "piped",
  });
  const { code, stdout, stderr } = await command.output();
  if (code !== 0) {
    console.error(new TextDecoder().decode(stderr));
    console.error(new TextDecoder().decode(stdout));
    throw new Error(`cargo build exited with ${code}`);
  }
}

async function main(): Promise<void> {
  const { cmd, noBuild } = parseArgs();
  let version = await readVersion();

  if (cmd === "patch" || cmd === "minor") {
    version = bump(version, cmd);
    await writePackageJsonVersion(version);
  }

  await syncTauriConf(version);
  await syncCargoToml(version);

  if (!noBuild) {
    await runCargoBuild();
  }

  if (noBuild) {
    console.log(`Version ${version} synced to package.json, tauri.conf.json, and Cargo.toml.`);
  } else {
    console.log(`Version ${version} synced and built.`);
  }
}

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
