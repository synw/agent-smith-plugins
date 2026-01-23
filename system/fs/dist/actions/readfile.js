/*
# tool
name: readfile
description: Read a file's content
arguments:
    path:
        description: The path of the file to read
        required: true
*/
import fs from 'fs/promises';

async function readFile (fp)
{
    try {
        const content = await fs.readFile(fp, { encoding: 'utf8' });
        return content;
    } catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
    }
}

async function action (args, options)
{
    let fp = "";
    if (Array.isArray(args)) {
        fp = args[0];
    } else {
        if (!typeof args == "string") {
            throw new Error("readfile action: input an array or string as parameter");
        }
        fp = args;
    }
    //console.log("RF FP", fp);
    return readFile(fp);
}

export { action, readFile };