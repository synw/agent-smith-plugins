/*
# tool
description: Get documentation about a command
arguments:
    command:
        description: "The command name or command name+subcommand to get information for. The optional subcommands must not start with `-`. Example: `pip`, `pip freeze`, `pip install`"
*/
import { execute, parseArgs } from "@agent-smith/cli";

async function action(args) {
    //console.log("AARGS", args);
    const { vars, conf } = parseArgs(args);
    //console.log("PARGS", vars, conf);
    if (vars.command.startsWith("sudo")) {
        return "can not get help for a command that uses sudo"
    }
    const c = vars.command.split(" ");
    const name = c.shift();
    let err = null;
    const onErr = (e) => { err = e };
    const res = await execute(name, [...c, "--help"], { onStderr: onErr });
    //console.log("RES", res);
    if (err) {
        return err
    }
    return res
}
export { action };
