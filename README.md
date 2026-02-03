# vision-ocr

CLI tool for image OCR using the macOS Vision Framework.

Uses **node-swift** to call Swift code directly from Node.js.

## Features

- Free - no API costs
- Offline - no network required
- Fast - native performance
- Korean and English support

## Requirements

- macOS 13.0+
- Swift 5.9+
- Node.js 18+

## Installation

```bash
npm install
npm run build:ts
```

Global install:

```bash
npm link
```

## Usage

```bash
# Extract text from clipboard image (also copies result to clipboard)
vision-ocr

# Extract text from a file
vision-ocr screenshot.png

# Output to stdout only, without copying to clipboard
vision-ocr --no-copy

# Pipe to a file
vision-ocr screenshot.png --no-copy > output.txt
```

## Project Structure

```
vision-ocr/
├── src/
│   ├── cli.ts              # CLI entry point
│   └── vision-ocr.ts       # Swift module wrapper
├── swift/
│   ├── Package.swift        # SwiftPM package
│   └── Sources/VisionOCR/
│       └── VisionOCR.swift  # Vision Framework OCR
└── package.json
```

## API

Can also be used programmatically:

```typescript
import {
  recognizeText,
  recognizeTextFromFile,
  recognizeTextFromClipboard,
} from 'vision-ocr'

const text = recognizeText(imageBuffer)
const text = recognizeTextFromFile('/path/to/image.png')
const text = recognizeTextFromClipboard()
```
