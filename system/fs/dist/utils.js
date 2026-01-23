import * as fs from 'fs';
import path from "path";

async function lsdir (args, options)
{
    let dirPath = "";
    if (Array.isArray(args)) {
        dirPath = args[0];
    } else {
        if (!typeof args == "string") {
            throw new Error("lsdir: input an array or string as parameter");
        }
        dirPath = args;
    }
    if (options?.debug) {
        console.log("Reading", dirPath);
    }
    let result = { files: [], dirs: [] };
    try {
        const files = await fs.promises.readdir(dirPath, { withFileTypes: true });
        for (const file of files) {
            if (file.isFile() && !options?.dirs) {
                const filePath = path.join(dirPath, file.name);
                result.files.push(filePath);
            } else if (file.isDirectory() && !options?.files) {
                const filePath = path.join(dirPath, file.name);
                result.dirs.push(filePath);
            }
        }
    } catch (err) {
        console.error('Error reading directory:', err);
    }
    if (options?.dirs) {
        result = result.dirs;
    }
    if (options?.files) {
        result = result.files;
    }
    if (options?.debug) {
        console.log(result);
    }
    return result;
}

function isPathDirectoryOrFile (filePath)
{
    try {
        const stats = fs.statSync(filePath);
        return stats.isDirectory();
    } catch (err) {
        console.warn(`Invalid path: ${filePath}`, err);
    }
}

export
{
    isPathDirectoryOrFile,
    lsdir,
};
