import { execute } from "@agent-smith/cli";

async function action(args)
{
    const diff = await execute("git", ["diff", ...args]);
    let msg = diff;
    const stagedDiff = await execute("git", ["diff", "--staged", ...args]);
    if (stagedDiff.length > 0) {
        msg += "\n" + stagedDiff
    }
    const res = { prompt: msg };
    //console.log("GIT DIFF RES", res)
    return res
}

export { action }