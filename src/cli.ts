#!/usr/bin/env node

import { Command } from 'commander'
import { execSync } from 'child_process'
import { resolve } from 'path'
import { recognizeTextFromFile, recognizeTextFromClipboard } from './vision-ocr'

function copyToClipboard(text: string): void {
  execSync('pbcopy', { input: text })
}

function run(): void {
  const program = new Command()

  program
    .name('vision-ocr')
    .description('Extract text from images using macOS Vision Framework')
    .version('1.0.0')
    .argument('[file]', 'image file path (reads from clipboard if omitted)')
    .option('--no-copy', 'do not copy result to clipboard')
    .action((file: string | undefined, options: { copy: boolean }) => {
      try {
        const text = file
          ? recognizeTextFromFile(resolve(file))
          : recognizeTextFromClipboard()

        if (!text || text.trim() === '') {
          process.stderr.write('No text recognized from the image.\n')
          process.exit(1)
        }

        process.stdout.write(text + '\n')

        if (options.copy) {
          copyToClipboard(text)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)

        if (message.includes('No image found')) {
          process.stderr.write('No image found in clipboard.\n')
          process.exit(1)
        }

        process.stderr.write(`OCR failed: ${message}\n`)
        process.exit(1)
      }
    })

  program.parse()
}

run()
