/*
# tool
name: rshell
description: "Execute read only shell commands"
arguments:
    command: 
        description: |-
            The shell command to execute (read only operations)
        required: true
parallel: false
*/
import { SimpleBox } from '@boxlite-ai/boxlite';

async function action(args: any, options: Record<string, any>) {
    //console.log("SHELL ARGS", args);
    //console.log("SHELL OPTS", options);
    const location = options?.variables?.path ?? options?.variables?.workspace;
    if (!location) {
        return "[Error]: shell tool missing path or workspace parameter"
    }
    if (options?.debug) {
        console.log('Opening box', location);
    }
    //console.log("Cmd:", cmd, cmdArgs);
    const box = new SimpleBox({
        image: 'timbru31/node-alpine-git',
        name: "shellbox",
        volumes: [
            { hostPath: location, guestPath: '/workspace', readOnly: true },
        ],
        network: { "mode": "disabled" },
        reuseExisting: true,
    });
    process.on('SIGINT', () => {
        box.getInfo().then(info => {
            //console.log("INFO", info);
            if (info.state.running) {
                console.log('\nExiting shell box');
                box.stop().then(() => process.exit(0));
            } else {
                process.exit(0)
            }
        })
    });
    let res = "";
    try {
        const result = await box.exec("sh", "-c", args.command);
        //console.log("CMD RES", result);
        if (result?.stderr.length > 0) {
            res = "[Error] exit code:" + result.exitCode + "\n" + result.stderr;
        }
        else {
            if (result.stdout == "") {
                res = "Exit code: " + result.exitCode;
            } else {
                res = result.stdout;
            }
        }
    } finally {
        if (options?.debug) {
            console.log("stopping shell box")
        }
        await box.stop();
    }
    return res
}

export {
    action,
}