import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

const filesToConvert = [
  { input: 'samuel.png', output: 'samuel.webp', width: 800 },
  { input: 'daraja.png', output: 'daraja-thumb.webp', width: 400 },
  { input: 'mindmate.png', output: 'mindmate.webp', width: 400 },
  { input: 'kwikihost.png', output: 'kwikihost.webp', width: 400 },
  { input: 'jeramoyie.png', output: 'jeramoyie.webp', width: 400 },
  { input: 'portfolio-banner.png', output: 'portfolio-banner.webp', width: 1200 },
];

async function convert() {
  for (const file of filesToConvert) {
    const inputPath = path.join(publicDir, file.input);
    const outputPath = path.join(publicDir, file.output);

    if (!fs.existsSync(inputPath)) {
      console.log(`SKIP: ${file.input} not found`);
      continue;
    }

    const inputSize = fs.statSync(inputPath).size;

    await sharp(inputPath)
      .resize(file.width, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const outputSize = fs.statSync(outputPath).size;
    const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);
    console.log(`${file.input} (${(inputSize / 1024 / 1024).toFixed(2)}MB) => ${file.output} (${(outputSize / 1024).toFixed(0)}KB) — ${savings}% smaller`);
  }
  console.log('\nDone! All images converted.');
}

convert().catch(console.error);
