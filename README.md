# @cbcruk/vision-ocr (archived)

This repository is archived. `vision-ocr` moved to
**[swiftx](https://github.com/cbcruk/swiftx)**, a monorepo of macOS framework CLIs and their Node
bridges, and now lives at
[`packages/vision-ocr`](https://github.com/cbcruk/swiftx/tree/main/packages/vision-ocr).

The npm package `@cbcruk/vision-ocr@1.0.3` published from here still installs and works. It is
the last release of the node-swift line; nothing further ships from this repository.

## What changed in 2.x

The Swift code no longer loads **into** Node. It builds as a standalone executable that Node
spawns and talks to over JSON.

- **No `postinstall` build, no Swift toolchain.** The package ships a prebuilt universal binary
  (arm64 + x86_64). 1.x compiled a native addon on every install.
- **Not tied to the Node ABI.** The addon had to match the N-API version of whatever Node ran it.
- **A crash in Vision no longer takes Node down.**
- `recognizeText`, `recognizeTextFromFile`, `recognizeTextFromClipboard` **keep their 1.x
  signatures** — synchronous, returning a string — so existing call sites keep working.
- New: `recognize()` (async), per-call `--languages`, per-line output, and transparent images
  composited onto white before recognition.
- Breaking: the `VisionOCR` native class export is gone, the package is **ESM only**, and
  failures throw `SwiftCliError` carrying the CLI's exit code instead of addon exceptions. Code
  that matched the string `'No image found'` should check
  `error.exitCode === VisionExitCode.clipboardEmpty`.

Full migration notes:
[packages/vision-ocr/README.md](https://github.com/cbcruk/swiftx/blob/main/packages/vision-ocr/README.md).

## Installing 2.x

swiftx packages are not on the npm registry — they are attached to
[GitHub releases](https://github.com/cbcruk/swiftx/releases) as tarballs, so the prebuilt binary
travels with them. The install snippet is in each release's notes.

Installing `@cbcruk/vision-ocr` from npm gives you **1.0.3**, this repository's last version.

## History

The Swift source was moved with `git subtree`, so its commit history is preserved in swiftx under
[`swift/vision`](https://github.com/cbcruk/swiftx/tree/main/swift/vision). The design record for
the recognizer — recognition level, language correction, line merging, transparency — is in
[`swift/vision/README.md`](https://github.com/cbcruk/swiftx/blob/main/swift/vision/README.md).

MIT
