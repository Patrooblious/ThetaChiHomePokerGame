// build-scripts/fingerprint.js
// ---------------------------------------------------
// This script dynamically imports rev-hash (an ESM) while
// keeping the rest of the code in CommonJS style.
// ---------------------------------------------------

const fs = require('fs-extra');
const path = require('path');

(async () => {
    // Dynamically import rev-hash (ESM)
    const { default: revHash } = await import('rev-hash');

    // 1. Define which files to fingerprint
    const assetsToFingerprint = [
        { src: 'public/style.css', type: 'css' },
        { src: 'public/script.js', type: 'js' },
        // Add more entries here if you ever want to fingerprint other .css/.js
    ];

    // 2. Helper: given a filepath, compute an 8-character hash of its contents
    async function computeHash(filePath) {
        const buffer = await fs.readFile(filePath);
        return revHash(buffer).slice(0, 8); // e.g. "3a7f2c9d"
    }

    // 3. Read all HTML pages in public/ so we can patch their <link> and <script> tags
    async function getAllHtmlFiles() {
        const files = await fs.readdir('public');
        return files
            .filter((f) => f.endsWith('.html'))
            .map((f) => path.join('public', f));
    }

    // 4. Main logic
    try {
        // Map original filenames → hashed filenames
        // e.g. { 'style.css': 'style.3a7f2c9d.css', ... }
        const fingerprintMap = {};

        // a) For each asset, compute hash, copy to new filename, and record the mapping
        for (const asset of assetsToFingerprint) {
            const absPath = path.resolve(asset.src); // e.g. /.../public/style.css
            if (!(await fs.pathExists(absPath))) {
                console.warn(`⚠️  Skipping fingerprint: file not found → ${asset.src}`);
                continue;
            }

            const hash = await computeHash(absPath); // e.g. "3a7f2c9d"
            const dirname = path.dirname(asset.src); // "public"
            const ext = path.extname(asset.src); // ".css" or ".js"
            const base = path.basename(asset.src, ext); // "style" or "script"

            // e.g. newName = "style.3a7f2c9d.css"
            const newName = `${base}.${hash}${ext}`;
            const newPath = path.join(dirname, newName);

            // Copy the file: public/style.css → public/style.3a7f2c9d.css
            await fs.copyFile(absPath, newPath);

            // Record the mapping so we can update HTML later
            fingerprintMap[`${base}${ext}`] = newName;
        }

        // b) Read and patch each HTML file in public/
        const htmlFiles = await getAllHtmlFiles();
        for (const htmlPath of htmlFiles) {
            let contents = await fs.readFile(htmlPath, 'utf8');

            // For each mapping, replace occurrences in the HTML.
            // Matches href="style.css" or src="script.js"
            for (const [orig, hashed] of Object.entries(fingerprintMap)) {
                const regex = new RegExp(`(href|src)=["']${orig}["']`, 'g');
                contents = contents.replace(regex, `$1="${hashed}"`);
            }

            await fs.writeFile(htmlPath, contents, 'utf8');
        }

        console.log('✅ Fingerprinting complete. Map:', fingerprintMap);
    } catch (err) {
        console.error('❌ Error in fingerprint script:', err);
        process.exit(1);
    }
})();