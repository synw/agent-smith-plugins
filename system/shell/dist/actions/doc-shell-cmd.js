/*
# tool
description: Get documentation about a command
arguments:
    command:
        description: "The command name or command name+subcommand to get information for. The optional subcommands must not start with `-`. Example: `pip`, `pip freeze`, `npm install`"
*/
import { utils } from "@agent-smith/core";

async function action(args, options) {
    //console.log("AARGS", args);
    //console.log("PARGS", vars, conf);
    if (args.command.startsWith("sudo")) {
        return "can not get help for a command that uses sudo";
    }
    const c = args.command.split(" ");
    const name = c.shift();
    let err = null;
    const onErr = (e) => { err = e; };
    const res = await utils.execute(name, [...c, "--help"], { onStderr: onErr });
    //console.log("RES", res);
    if (err) {
        return err;
    }
    return res;
}
export { action };
