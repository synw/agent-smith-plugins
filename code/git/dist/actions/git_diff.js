import { execute } from "@agent-smith/cli";

async function action(args, options)
{
    const diff = await execute("git", ["diff", ...args]);
    if (options.verbose || options.debug) {
        console.log("Executing", "git diff", args.join(" "));
    }
    let msg = diff;
    const stagedDiff = await execute("git", ["diff", "--staged", ...args]);
    if (options.verbose || options.debug) {
        console.log("Executing", "git diff --staged", args.join(" "));
    }
    if (stagedDiff.length > 0) {
        msg += "\n" + stagedDiff
    }
    if (options.debug) {
        console.log(msg)
    }
    const res = { prompt: msg };
    //console.log("GIT DIFF RES", res)
    return res
}

export { action }