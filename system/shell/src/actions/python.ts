/*
# tool
name: python
description: Execute some Python code
arguments:
    packages:
        description: "A list of packages to be install (optional): example: requests,numpy"
    code:
        description: The code to execute
        required: true
*/
import { CodeBox } from '@boxlite-ai/boxlite';

async function action(args: any, options: Record<string, any>) {
    const location = options?.variables?.path ?? options?.variables?.workspace;
    if (!location) {
        return "[Error]: shell tool missing path or workspace parameter"
    }
    if (options?.debug) {
        console.log('Opening box', location);
    }
    const box = new CodeBox({
        image: 'python:slim',
        name: "codebox",
        volumes: [
            { hostPath: location, guestPath: '/workspace' },
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
            }
            else {
                process.exit(0);
            }
        });
    });
    if (args?.packages) {
        await box.installPackages(...args.packages.split(","));
    }
    let res = "";
    try {
        res = await box.run(args.code);
    } finally {
        await box.stop();
    }
    return res
}

export {
    action,
}