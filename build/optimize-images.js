const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../public/images');
const OUTPUT_DIR = path.join(__dirname, '../public/optimized');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'assets-manifest.json');

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

const SIZES = [
  { name: 'thumb', width: 300 },
  { name: 'medium', width: 800 },
  { name: 'full', width: null } // original size
];

const FORMATS = ['webp', 'avif'];
const CONCURRENCY_LIMIT = 5;

// Quality settings for various formats
const QUALITY_SETTINGS = {
  webp: { quality: 80, lossless: false, effort: 4 },
  avif: { quality: 65, lossless: false, effort: 4 }
};

/**
 * Ensures that the target directory exists, creating it recursively if needed.
 * @param {string} dirPath - The absolute path of the directory.
 */
async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Generates a Low-Quality Image Placeholder (LQIP) as a Base64-encoded Data URL.
 * Used for instant skeleton layouts and blur-up loading styles.
 * 
 * @param {string} inputPath - The absolute path to the input image file.
 * @returns {Promise<string>} The base64 data url.
 */
async function generateLQIP(inputPath) {
  try {
    const lqipBuffer = await sharp(inputPath)
      .resize(16, 16, { fit: 'inside' })
      .webp({ quality: 20 })
      .toBuffer();
    return `data:image/webp;base64,${lqipBuffer.toString('base64')}`;
  } catch (err) {
    console.warn(`[WARN] Failed to generate LQIP for ${path.basename(inputPath)}:`, err.message);
    return null;
  }
}

/**
 * Processes a single input image by generating responsive widths (thumb, medium, full)
 * in next-gen formats (WebP, AVIF), compiling metadata, and generating a Base64 LQIP placeholder.
 * 
 * @param {string} inputPath - Absolute path to the source image file.
 * @param {string} relativePath - Relative path structure from INPUT_DIR.
 */
async function processImage(inputPath, relativePath) {
  const filename = path.basename(relativePath);
  const ext = path.extname(filename).toLowerCase();
  const nameWithoutExt = path.basename(filename, ext);
  const relDir = path.dirname(relativePath);
  
  const outDir = path.join(OUTPUT_DIR, relDir);
  await ensureDir(outDir);

  const inputStats = await fs.stat(inputPath);
  const inputTime = inputStats.mtimeMs;
  let skipped = 0;
  let processed = 0;
  let bytesSaved = 0;
  
  const manifestEntry = {
    originalSize: inputStats.size,
    lqip: await generateLQIP(inputPath)
  };

  for (const size of SIZES) {
    manifestEntry[size.name] = {};
    const suffix = size.name === 'full' ? '' : `-${size.name}`;
    
    for (const format of FORMATS) {
      const outFilename = `${nameWithoutExt}${suffix}.${format}`;
      const outPath = path.join(outDir, outFilename);
      const posixRelDir = relDir.split(path.sep).join(path.posix.sep);
      const outRelPath = path.posix.join(posixRelDir === '.' ? '' : posixRelDir, outFilename);

      let shouldProcess = true;
      try {
        const outStats = await fs.stat(outPath);
        if (outStats.mtimeMs >= inputTime) {
          shouldProcess = false; // skip if output is newer
          skipped++;
        }
      } catch {
        // file doesn't exist, proceed
      }

      if (shouldProcess) {
        try {
          let pipeline = sharp(inputPath);
          
          // Preserving color profile, ICC and core EXIF tags
          pipeline = pipeline.keepMetadata();

          if (size.width) {
            pipeline = pipeline.resize({ 
              width: size.width, 
              withoutEnlargement: true,
              fit: 'inside'
            });
          }
          
          if (format === 'webp') {
            pipeline = pipeline.webp(QUALITY_SETTINGS.webp);
          } else if (format === 'avif') {
            pipeline = pipeline.avif(QUALITY_SETTINGS.avif);
          }
          
          await pipeline.toFile(outPath);
          
          const newStats = await fs.stat(outPath);
          
          // calculate bytes saved for 'full' size vs original
          if (size.name === 'full') {
            bytesSaved += Math.max(0, inputStats.size - newStats.size);
          }

          processed++;
        } catch (err) {
          throw new Error(`Failed to process ${outFilename}: ${err.message}`);
        }
      }
      
      // Update manifest
      manifestEntry[size.name][format] = outRelPath;
    }
  }

  return { processed, skipped, bytesSaved, manifestEntry };
}

/**
 * Traverses directories recursively to locate all nested files.
 * @param {string} dir - The absolute directory path.
 * @returns {Promise<string[]>} A flat array of nested file paths.
 */
async function walkDir(dir) {
  let results = [];
  const list = await fs.readdir(dir);
  for (let file of list) {
    file = path.join(dir, file);
    const stat = await fs.stat(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(await walkDir(file));
    } else {
      results.push(file);
    }
  }
  return results;
}

/**
 * Processes items concurrently with a concurrency limit.
 * 
 * @param {Array} items - The items to process.
 * @param {number} limit - Concurrency threshold limit.
 * @param {Function} processor - Asynchronous item handler function.
 */
async function processConcurrently(items, limit, processor) {
  let active = 0;
  let index = 0;
  const results = [];
  const errors = [];

  return new Promise((resolve) => {
    const next = async () => {
      if (index >= items.length && active === 0) {
        resolve({ results, errors });
        return;
      }

      while (active < limit && index < items.length) {
        const currentIndex = index++;
        active++;
        
        processor(items[currentIndex])
          .then(res => results.push(res))
          .catch(err => errors.push(err))
          .finally(() => {
            active--;
            next();
          });
      }
    };
    next();
  });
}

/**
 * Orchestrator entry point that scans directories, triggers concurrent tasks,
 * aggregates report metadata, and writes the JSON asset manifest.
 */
async function main() {
  console.log('🚀 Starting advanced image optimization pipeline...');
  const startTime = Date.now();
  
  try {
    await ensureDir(INPUT_DIR);
    await ensureDir(OUTPUT_DIR);
  } catch (err) {
    console.error('❌ Failed to initialize directories:', err);
    process.exit(1);
  }

  const files = await walkDir(INPUT_DIR);
  
  const imageFiles = files.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(ext);
  });

  console.log(`📸 Found ${imageFiles.length} image(s) to process in ${INPUT_DIR}`);

  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalBytesSaved = 0;
  let totalErrors = 0;
  const manifest = {};

  const { results, errors } = await processConcurrently(
    imageFiles, 
    CONCURRENCY_LIMIT, 
    async (file) => {
      const relPath = path.relative(INPUT_DIR, file);
      const posixRelPath = relPath.split(path.sep).join(path.posix.sep); // Normalize for manifest
      
      try {
        const { processed, skipped, bytesSaved, manifestEntry } = await processImage(file, relPath);
        return { posixRelPath, processed, skipped, bytesSaved, manifestEntry, error: null };
      } catch (err) {
        return { posixRelPath, error: err };
      }
    }
  );

  for (const res of results) {
    if (res.error) {
       console.warn(`[WARN] Skipping ${res.posixRelPath} - ${res.error.message}`);
       totalErrors++;
    } else {
       totalProcessed += res.processed;
       totalSkipped += res.skipped;
       totalBytesSaved += res.bytesSaved;
       manifest[res.posixRelPath] = res.manifestEntry;
    }
  }
  
  for (const err of errors) {
      console.error(`[ERROR] Unexpected pipeline error:`, err);
      totalErrors++;
  }

  // Save manifest
  try {
    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`\n📄 Manifest generated at: ${MANIFEST_PATH}`);
  } catch (err) {
    console.error(`[ERROR] Failed to save manifest:`, err);
  }

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  const megabytesSaved = (totalBytesSaved / (1024 * 1024)).toFixed(2);

  console.log('\n✨ --- Optimization Report --- ✨');
  console.log(`⏱️  Time taken: ${timeTaken} seconds`);
  console.log(`⚙️  Variants generated: ${totalProcessed}`);
  console.log(`⏭️  Variants skipped: ${totalSkipped}`);
  console.log(`⚠️  Errors encountered: ${totalErrors}`);
  console.log(`💾 Bandwidth saved (full vs original): ~${megabytesSaved} MB`);
  console.log('---------------------------------\n');
}

main().catch(err => {
  console.error('❌ Fatal error during optimization:', err);
  process.exit(1);
});
