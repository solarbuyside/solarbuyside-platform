const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../public/assets');

// Get all image files
const imageFiles = fs.readdirSync(assetsDir).filter(file => {
  return /\.(jpg|jpeg|png|webp)$/i.test(file);
});

console.log(`🖼️  Encontrados ${imageFiles.length} arquivos de imagem`);
console.log('📦 Comprimindo imagens...\n');

let totalOriginal = 0;
let totalOptimized = 0;

async function optimizeImage(filename) {
  const inputPath = path.join(assetsDir, filename);
  const ext = path.extname(filename).toLowerCase();

  // Get original size
  const originalStats = fs.statSync(inputPath);
  const originalSize = originalStats.size;
  totalOriginal += originalSize;

  try {
    let image = sharp(inputPath);

    // Get metadata
    const metadata = await image.metadata();

    // Optimize based on file type
    if (ext === '.png') {
      await image
        .png({ quality: 85, compressionLevel: 9, effort: 10 })
        .toFile(inputPath + '.tmp');
    } else if (ext === '.jpg' || ext === '.jpeg') {
      await image
        .jpeg({ quality: 85, mozjpeg: true })
        .toFile(inputPath + '.tmp');
    } else if (ext === '.webp') {
      await image
        .webp({ quality: 85, effort: 6 })
        .toFile(inputPath + '.tmp');
    }

    // Check if optimized version is smaller
    const optimizedStats = fs.statSync(inputPath + '.tmp');
    const optimizedSize = optimizedStats.size;

    if (optimizedSize < originalSize) {
      // Replace original with optimized
      fs.unlinkSync(inputPath);
      fs.renameSync(inputPath + '.tmp', inputPath);

      totalOptimized += optimizedSize;
      const saved = originalSize - optimizedSize;
      const savedPercent = ((saved / originalSize) * 100).toFixed(1);

      console.log(`✅ ${filename}`);
      console.log(`   ${(originalSize / 1024).toFixed(1)} KB → ${(optimizedSize / 1024).toFixed(1)} KB (${savedPercent}% menor)`);
    } else {
      // Keep original
      fs.unlinkSync(inputPath + '.tmp');
      totalOptimized += originalSize;
      console.log(`⏭️  ${filename} (já otimizado)`);
    }
  } catch (error) {
    console.error(`❌ Erro em ${filename}:`, error.message);
    totalOptimized += originalSize;
    // Clean up tmp file if it exists
    try {
      fs.unlinkSync(inputPath + '.tmp');
    } catch {}
  }
}

async function optimizeAll() {
  for (const file of imageFiles) {
    await optimizeImage(file);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DA OTIMIZAÇÃO');
  console.log('='.repeat(60));
  console.log(`Tamanho original:  ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Tamanho otimizado: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Economia total:    ${((totalOriginal - totalOptimized) / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Redução:           ${(((totalOriginal - totalOptimized) / totalOriginal) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
}

optimizeAll().catch(console.error);
