import fs from 'fs';
import path from 'path';

function writeToFile (filePath, content, isVerbose)
{
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
        throw new Error(`The directory ${dirPath} does not exist`);
    }
    try {
        // Write content to file
        fs.writeFileSync(filePath, content);
        if (isVerbose) {
            console.log(`File ${filePath} written`);
        }
    } catch (e) {
        throw new Error(`writing file ${filePath}, ${e}`);
    }
}

async function action (args, options)
{
    let isVerbose = options?.verbose || options?.debug;
    if (args.length < 2) {
        throw new Error("Provide both a content string and a file path");
    }
    const content = args[0];
    const filePath = args[1];
    writeToFile(filePath, content, isVerbose);
}

export { action, writeToFile };