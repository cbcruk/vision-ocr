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

## Using with an LLM agent (e.g. a PDF translator)

This section is written for coding agents and LLM-driven pipelines that combine `vision-ocr` with a model such as Claude. Read the constraints first — they determine the shape of any pipeline built on top of this module.

### Constraints an agent must know

- **Input is an image, not a PDF.** All three functions accept image bytes (PNG, TIFF, etc.) or an image file path. There is **no** `recognizeTextFromPDF`. To OCR a PDF you must rasterize each page to an image first (see the recipe below).
- **macOS-only, synchronous, in-process.** The functions run the native Swift module synchronously on the calling thread and throw on failure (bad image, empty clipboard). Wrap calls in `try/catch`. For many pages, run OCR in a worker or child process to avoid blocking.
- **Languages are fixed at `ko-KR` + `en-US`.** Recognition languages are compiled into `swift/Sources/VisionOCR/VisionOCR.swift` (`request.recognitionLanguages`). Other languages require editing that array and rebuilding the Swift module — they are not configurable at runtime.
- **Output is plain text with layout heuristics.** Lines are ordered top-to-bottom, left-to-right and joined with `\n`. There is no bounding-box, confidence, or word-level output exposed to JavaScript. Treat the result as a best-effort reading-order transcript, not structured data.
- **Empty result is valid.** An image with no detectable text returns `''` (not an error). Check for an empty/whitespace string before sending anything downstream.

### PDF → OCR → translate pipeline

The natural design for a PDF translator is a three-stage pipeline:

```
PDF ──(rasterize per page)──▶ PNG images ──(vision-ocr)──▶ text ──(LLM)──▶ translated text
```

**Stage 1 — rasterize the PDF to page images.** `vision-ocr` does not do this; use an external tool. On macOS, [`pdftoppm`](https://poppler.freedesktop.org/) (from `brew install poppler`) is reliable:

```bash
# One PNG per page: page-1.png, page-2.png, ...
pdftoppm -png -r 200 input.pdf page
```

A higher DPI (`-r 200`–`300`) improves OCR accuracy at the cost of speed. A pure-Node alternative is a library such as `pdf-to-img`.

**Stage 2 — OCR each page image** with `recognizeTextFromFile`.

**Stage 3 — translate** the extracted text with an LLM. The example below uses the official Anthropic SDK (`npm install @anthropic-ai/sdk`) and `claude-opus-4-8`:

```typescript
import { readdirSync } from 'fs'
import Anthropic from '@anthropic-ai/sdk'
import { recognizeTextFromFile } from '@cbcruk/vision-ocr'

const anthropic = new Anthropic() // reads ANTHROPIC_API_KEY from the environment

async function translate(text: string, targetLang = 'Korean'): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 16000,
    system: `You are a translation engine. Translate the user's text into ${targetLang}. Preserve line breaks and formatting. Output only the translation.`,
    messages: [{ role: 'user', content: text }],
  })

  return message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
}

async function translatePdfPages(dir: string): Promise<void> {
  const pages = readdirSync(dir)
    .filter((f) => f.endsWith('.png'))
    .sort()

  for (const page of pages) {
    const text = recognizeTextFromFile(`${dir}/${page}`)
    if (!text.trim()) continue // skip pages with no recognized text

    const translated = await translate(text)
    console.log(`\n=== ${page} ===\n${translated}`)
  }
}
```

Notes for agents building on this:

- OCR (stage 2) is synchronous and CPU-bound; translation (stage 3) is an async network call. Keep them in separate stages so pages can be OCR'd up front and translated with controlled concurrency.
- Send one page (or a small batch) per LLM request rather than an entire document, to stay within output limits and keep failures isolated to a page.
- OCR text may contain artifacts (broken words, misread characters). Instructing the model to "fix obvious OCR errors while translating" in the system prompt improves results on noisy scans.

## License

MIT
