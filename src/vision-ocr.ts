import path from 'path'

/** Native Swift module loaded via node-swift. */
interface VisionOCRModule {
  VisionOCR: {
    recognizeText(buffer: Buffer): string
    recognizeTextFromFile(path: string): string
    recognizeTextFromClipboard(): string
  }
}

const modulePath = path.join(__dirname, '../.build/VisionOCR.node')
const native: VisionOCRModule = require(modulePath)

export const VisionOCR = native.VisionOCR

/**
 * Extracts text from raw image data using macOS Vision Framework.
 * @param buffer - Image data (PNG, TIFF, etc.).
 * @returns Recognized text with lines joined by newlines.
 */
export function recognizeText(buffer: Buffer): string {
  return VisionOCR.recognizeText(buffer)
}

/**
 * Extracts text from an image file.
 * @param filePath - Absolute path to the image file.
 * @returns Recognized text with lines joined by newlines.
 */
export function recognizeTextFromFile(filePath: string): string {
  return VisionOCR.recognizeTextFromFile(filePath)
}

/**
 * Extracts text from the current clipboard image.
 * Reads PNG, TIFF, or file URL data from the system pasteboard.
 * @returns Recognized text with lines joined by newlines.
 * @throws If no image is found in the clipboard.
 */
export function recognizeTextFromClipboard(): string {
  return VisionOCR.recognizeTextFromClipboard()
}
