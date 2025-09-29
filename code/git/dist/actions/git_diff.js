import { execute } from "@agent-smith/cli";

async function action(args) {
    const gitParams = [];
    for (const arg of args) {
        if (!arg.includes("=")) {
            gitParams.push(arg)
        }
    }
    //console.log("************ git diff", ...gitParams)
    const diff = await execute("git", ["diff", ...gitParams]);
    let msg = diff;
    const stagedDiff = await execute("git", ["diff", "--staged", ...gitParams]);
    if (stagedDiff.length > 0) {
        msg += "\n" + stagedDiff
    }
    const res = { prompt: msg };
    //console.log("GIT DIFF RES", res)
    return res
}

export { action }