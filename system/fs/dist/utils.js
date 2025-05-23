import * as fs from 'fs';

function isPathDirectoryOrFile(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.isDirectory();
    } catch (err) {
        console.warn(`Invalid path: ${filePath}`, err);
    }
}

export {
    isPathDirectoryOrFile,
}