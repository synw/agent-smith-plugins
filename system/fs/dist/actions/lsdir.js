/*
# tool
name: lsdir
description: List files and folders names in a directory
arguments:
    dirPath:
        description: The path of the directory to read
        required: true
*/
import { lsdir } from "../utils.js";

async function action (args, options)
{
    return await lsdir(args, options);
}

export { action };