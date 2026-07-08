# @cbcruk/vision-ocr

CLI and Node.js library for extracting text from images using the macOS **Vision Framework**.

It uses [node-swift](https://github.com/kabiroberai/node-swift) to call native Swift code directly from Node.js, so OCR runs entirely on-device with no external dependencies.

## Features

- **Free** – no API keys or usage costs
- **Offline** – runs fully on-device, no network required
- **Fast** – native macOS performance
- **Multi-language** – Korean (`ko-KR`) and English (`en-US`) recognition
- **Layout-aware** – observations are sorted top-to-bottom, left-to-right, and merged into lines
- **Flexible input** – read from a file, a raw image buffer, or the clipboard

## Requirements

- macOS 13.0 (Ventura) or later
- Swift 5.9+ (Xcode Command Line Tools)
- Node.js 18+

> A native Swift module is compiled on install via the `postinstall` script, so a working Swift toolchain is required.

## Installation

### As a library

```bash
npm install @cbcruk/vision-ocr
```

### As a CLI

```bash
# Global install
npm install -g @cbcruk/vision-ocr

# Or run without installing
npx @cbcruk/vision-ocr
```

## CLI Usage

```bash
# Extract text from the clipboard image (result is also copied back to the clipboard)
vision-ocr

# Extract text from a file
vision-ocr screenshot.png

# Print to stdout only, without copying to the clipboard
vision-ocr --no-copy

# Redirect output to a file
vision-ocr screenshot.png --no-copy > output.txt
```

| Argument / Option | Description |
| ----------------- | ----------- |
| `[file]`          | Path to an image file. Reads from the clipboard when omitted. |
| `--no-copy`       | Do not copy the recognized text back to the clipboard. |

The command exits with code `1` and writes to stderr if no image is found or no text is recognized.

## API Usage

```typescript
import {
  recognizeText,
  recognizeTextFromFile,
  recognizeTextFromClipboard,
} from '@cbcruk/vision-ocr'

// From a raw image buffer (PNG, TIFF, etc.)
const text = recognizeText(imageBuffer)

// From a file path
const text = recognizeTextFromFile('/path/to/image.png')

// From the current clipboard image
const text = recognizeTextFromClipboard()
```

### API Reference

| Function | Parameter | Returns | Notes |
| -------- | --------- | ------- | ----- |
| `recognizeText(buffer)` | `Buffer` – raw image data | `string` | Recognized text, lines joined by `\n`. |
| `recognizeTextFromFile(filePath)` | `string` – absolute path | `string` | Reads and OCRs the file. |
| `recognizeTextFromClipboard()` | – | `string` | Reads PNG, TIFF, or a file URL from the pasteboard. Throws if no image is found. |

## How it works

The Swift layer (`swift/Sources/VisionOCR`) wraps Apple's `VNRecognizeTextRequest`:

- Recognition level is set to `.accurate` with language correction enabled.
- Languages are configured as `ko-KR` and `en-US`.
- Each text observation is positioned by its bounding box; results are sorted top-to-bottom and left-to-right, and observations within a small vertical threshold are merged into a single line.

The TypeScript layer (`src/`) loads the compiled native module (`.build/VisionOCR.node`) and exposes the CLI (`src/cli.ts`) and the library API (`src/vision-ocr.ts`).

## Building from source

```bash
git clone https://github.com/cbcruk/node-vision-ocr
cd node-vision-ocr
npm install

# Build both the Swift module and the TypeScript output
npm run build

# Individual steps
npm run build:swift   # compile the native Swift module
npm run build:ts      # compile TypeScript to dist/
npm run clean         # remove dist/ and .build/
```

## License

MIT
