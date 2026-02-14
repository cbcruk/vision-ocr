# @cbcruk/vision-ocr

CLI and Node.js library for image OCR using the macOS Vision Framework.

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

### As a library

```bash
npm install @cbcruk/vision-ocr
```

### As a CLI

```bash
# Global install
npm install -g @cbcruk/vision-ocr

# Or use without installing
npx @cbcruk/vision-ocr
```

## CLI Usage

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

## API Usage

```typescript
import {
  recognizeText,
  recognizeTextFromFile,
  recognizeTextFromClipboard,
} from '@cbcruk/vision-ocr'

// From raw image buffer
const text = recognizeText(imageBuffer)

// From file path
const text = recognizeTextFromFile('/path/to/image.png')

// From clipboard
const text = recognizeTextFromClipboard()
```

## License

MIT
