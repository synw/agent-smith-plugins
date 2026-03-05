/*
# tool
name: writetofile
description: Write to a file
arguments:
    path:
        description: The path of the file to write
        required: true
    content:
        description: The content of the file to write
        required: true
*/
import fs from 'fs';
import path from 'path';

function writeToFile(filePath, content, isVerbose) {
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

async function action(args, options) {
    let isVerbose = options?.verbose || options?.debug;
    if (args.length < 2) {
        throw new Error("Provide both a file path and a content string");
    }
    let content;
    let filepath;
    if (args?.path && args?.content) {
        content = args.content;
        filepath = args.path;
    } else {
        content = args[1];
        filepath = args[0];
    }
    if (!filepath) {
        console.log("ARGS", args);
        console.log("OPTS", options);
        throw new Error("writetofile: no filepath provided");
    }
    //console.log("WRITE", filepath, content);
    writeToFile(filepath, content, isVerbose);
    return `Ok: file ${filepath} written`;
}

export { action, writeToFile };