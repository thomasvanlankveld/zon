# Static checks

## Pre-commit typechecking

`lint-staged` passes specific file names to the configured task. When `tsc` receives specific file names, it ignores `tsconfig.json`, causing it to crash on basic stuff such as locating `Promise`. There's a package to address this called [tsc-files](https://www.npmjs.com/package/tsc-files), but it's a bit obscure.

- [Run a TypeScript type check in your pre-commit hook using lint-staged + husky - DEV Community](https://dev.to/samueldjones/run-a-typescript-type-check-in-your-pre-commit-hook-using-lint-staged-husky-30id)
- [tsc-files - npm](https://www.npmjs.com/package/tsc-files)
