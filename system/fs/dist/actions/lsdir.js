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

async function action(args, options) {
    let ok = false;
    if ("authorized-paths" in options) {
        const aps = options["authorized-paths"].split(",");
        for (const ap of aps) {
            if (args.dirPath.includes(ap)) {
                ok = true;
                break;
            }
        }
    } else {
        ok = true;
    }
    if (!ok) {
        return "unauthorized path " + args.dirPath;
    }
    return await lsdir(args.dirPath, options);
}

export { action };