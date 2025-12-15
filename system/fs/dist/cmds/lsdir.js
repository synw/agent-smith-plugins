import { parseCommandArgs, displayOptions } from "@agent-smith/cli";
import { Command } from "commander";
import path from "path";
import fs from 'fs';

async function lsdir(args, options)
{
    const dirPath = args[0];
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
        result = result.dirs
    }
    if (options?.files) {
        result = result.files
    }
    return result;
}

const cmd = new Command("lsdir")
    .argument("[args...]")
    .description("List files and directories in a folder: lm lsdir path/to/folder")
    .option("--files", "list only the files")
    .option("--dirs", "list only the directories")
    .action((..._args) =>
    {
        const { args, options } = parseCommandArgs(_args)
        lsdir(args, options)
    });
displayOptions.forEach(o => cmd.addOption(o))

export { cmd, lsdir };
