import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTERS_DIR = path.resolve(__dirname, '../public/assets/posters');
const BANNERS_DIR = path.resolve(__dirname, '../public/assets/banners');

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function optimizeFolder(dirPath, { width, height, fit, quality, label }) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);

  console.log(`\n🖼️ Optimizing ${label} (${width}px target)...`);
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;
    if (file.includes('_temp')) {
      fs.unlinkSync(path.join(dirPath, file));
      continue;
    }

    const baseName = path.basename(file, ext);
    const inputPath = path.join(dirPath, file);
    const outputPath = path.join(dirPath, `${baseName}.webp`);

    const statsBefore = fs.statSync(inputPath);
    totalBefore += statsBefore.size;

    try {
      // Read into buffer to prevent Windows file handle locking
      const inputBuffer = fs.readFileSync(inputPath);

      const optimizedBuffer = await sharp(inputBuffer)
        .resize(width, height, { fit, withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toBuffer();

      // If input was a different extension (like .jpg or .jpeg), delete it
      if (inputPath !== outputPath && fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }

      // Write optimized buffer to outputPath
      fs.writeFileSync(outputPath, optimizedBuffer);

      const statsAfter = fs.statSync(outputPath);
      totalAfter += statsAfter.size;

      const reduction = Math.round((1 - statsAfter.size / statsBefore.size) * 100);
      console.log(`  ✓ ${file} → ${baseName}.webp: ${formatBytes(statsBefore.size)} → ${formatBytes(statsAfter.size)} (${reduction}% smaller)`);
    } catch (err) {
      console.error(`  ✗ Error optimizing ${file}:`, err.message);
    }
  }

  if (totalBefore > 0) {
    const totalReduction = Math.round((1 - totalAfter / totalBefore) * 100);
    console.log(`📊 ${label} Summary: ${formatBytes(totalBefore)} → ${formatBytes(totalAfter)} (${totalReduction}% total savings)`);
  }
}

async function run() {
  console.log('🚀 Starting WebP Image Optimization Pipeline...');
  
  // 1. Optimize 2:3 Movie Posters (max width 600px, quality 85)
  await optimizeFolder(POSTERS_DIR, {
    width: 600,
    height: 900,
    fit: 'cover',
    quality: 85,
    label: 'Movie Posters'
  });

  // 2. Optimize 16:9 Hero Banners (max width 1920px, quality 82)
  await optimizeFolder(BANNERS_DIR, {
    width: 1920,
    height: 1080,
    fit: 'cover',
    quality: 82,
    label: 'Hero Banners'
  });

  console.log('\n✨ All assets converted to high-performance modern WebP!');
}

run();
