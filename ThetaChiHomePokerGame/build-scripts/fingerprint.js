// build-scripts/fingerprint.js
// ---------------------------------------------------
// This version writes the new style.<hash>.css and
// script.<hash>.js and also removes any old fingerprinted
// files in public/ that no longer match the current hash.
// ---------------------------------------------------

const fs = require('fs-extra');
const path = require('path');

(async () => {
    const { default: revHash } = await import('rev-hash');

    const assetsToFingerprint = [
        { src: 'public/style.css', ext: '.css' },
        { src: 'public/script.js', ext: '.js' },
    ];

    async function computeHash(filePath) {
        const buffer = await fs.readFile(filePath);
        return revHash(buffer).slice(0, 8);
    }

    async function listPublicFilesWithExtension(ext) {
        const allFiles = await fs.readdir('public');
        return allFiles.filter((f) => f.endsWith(ext) && f !== `style.css` && f !== `script.js`);
    }

    try {
        const fingerprintMap = {};

        for (const { src, ext } of assetsToFingerprint) {
            const absPath = path.resolve(src);
            if (!(await fs.pathExists(absPath))) {
                console.warn(`⚠️  Skipping fingerprint: file not found → ${src}`);
                continue;
            }

            const hash = await computeHash(absPath);
            const dirname = path.dirname(src);
            const base = path.basename(src, ext);
            const newName = `${base}.${hash}${ext}`;
            const newPath = path.join(dirname, newName);

            await fs.copyFile(absPath, newPath);
            fingerprintMap[`${base}${ext}`] = newName;
        }

        async function getAllHtmlFiles() {
            const files = await fs.readdir('public');
            return files.filter((f) => f.endsWith('.html')).map((f) => path.join('public', f));
        }

        const htmlFiles = await getAllHtmlFiles();
        for (const htmlPath of htmlFiles) {
            let contents = await fs.readFile(htmlPath, 'utf8');

            for (const [orig, hashed] of Object.entries(fingerprintMap)) {
                const base = orig.split('.')[0];
                const ext = orig.split('.')[1];

                const regex = new RegExp(`(href|src)=["']${base}(\\.[a-f0-9]{8})?\\.${ext}["']`, 'g');
                contents = contents.replace(regex, `$1="${hashed}"`);
            }

            await fs.writeFile(htmlPath, contents, 'utf8');
        }

        const cssFiles = await listPublicFilesWithExtension('.css');
        for (const fname of cssFiles) {
            if (fname !== fingerprintMap['style.css']) {
                await fs.remove(path.join('public', fname));
                console.log(`🗑️  Removed old CSS: ${fname}`);
            }
        }

        const jsFiles = await listPublicFilesWithExtension('.js');
        for (const fname of jsFiles) {
            if (fname !== fingerprintMap['script.js']) {
                await fs.remove(path.join('public', fname));
                console.log(`🗑️  Removed old JS: ${fname}`);
            }
        }

        console.log('✅ Fingerprinting + cleanup complete. Map:', fingerprintMap);
    } catch (err) {
        console.error('❌ Error in fingerprint script:', err);
        process.exit(1);
    }
})();