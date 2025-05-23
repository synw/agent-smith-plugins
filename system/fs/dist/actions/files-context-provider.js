import { executeActionCmd, initState, parseArgs } from "@agent-smith/cli"
import { isPathDirectoryOrFile } from "../utils.js";
//import {readP}

async function action(_args) {
    await initState();
    const { vars, conf, args } = parseArgs(_args);
    console.log("VARS", vars);
    console.log("CONF", conf);
    console.log("ARGS", args);
    const res = await executeActionCmd(["files-to-prompt", ...args], {
        onStdout: console.log
    });
    console.log("RES", res);

}

export { action }