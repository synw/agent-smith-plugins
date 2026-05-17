import { writeFileSync } from "fs";
import { Command } from "commander";
import select from '@inquirer/select';
import {
    utils,
    state,
    executeTask,
    executeAction,
} from "@agent-smith/core";
import {
    allOptions,
    parseCommandArgs,
} from "@agent-smith/cli";

const choices = [
    {
        name: 'Commit',
        value: 'commit',
        description: 'Run the commit command with this message',
    },
    {
        name: 'Copy',
        value: 'copy',
        description: 'Copy the commit message to the clipboard',
    },
    {
        name: 'Commit only the first line',
        value: 'line',
        description: 'Run the commit command with the first line of the message only',
    },
    {
        name: 'File',
        value: 'file',
        description: 'Save the commit message into a ./tmp.txt file',
    },
    {
        name: 'Cancel',
        value: 'cancel',
        description: 'Cancel the commit',
    },
];

async function run(args, options) {
    await state.init();
    //let taskName = "checkdiff";
    /*if (options?.pkg) {
        taskName = "git_commit_pkg";
        //options.vars = ["pkg", options.pkg]
    } else if (options?.message) {
        //options.vars = ["message", options.message]
        taskName = "git_commit_details";
    }*/
    console.log("Analyzing the git diff ...");
    //console.log("T", taskName);
    //console.log("ARGS", args);
    //console.log("OPTS", options)
    // 1. get the diff
    const rdiff = await executeAction("git_diff", ...args, {}, true);
    const diff = rdiff.prompt;
    // 2. analyze the diff
    const ares = await executeTask("analyze_diff", {
        "prompt": diff,
    }, {});
    const analysis = utils.extractBetweenTags(ares.answer.text, ares.template.tags.think.start, ares.template.tags.think.end);
    // 3. write the commit
    console.log("Creating a commit message ...");
    const resp = await executeTask("commit_analyze_msg", {

        "prompt": analysis,
    }, { "diff": diff, });
    // 4. user process the commit
    const final = utils.extractBetweenTags(resp.answer.text, "<commit>", "</commit>");
    console.log("\n--------------------------------------------------------");
    console.log(final);
    console.log("--------------------------------------------------------\n");
    const answer = await select({
        message: 'Select an action',
        default: "commit",
        choices: choices,
    });
    //console.log(answer);
    let flagPath = ["-a"];
    if (args.length > 0) {
        flagPath = args;
    }
    switch (answer) {
        case "copy":
            utils.writeToClipboard(final);
            break;
        case "file":
            const tmpFile = process.cwd() + "/tmp.txt";
            writeFileSync(tmpFile, final, { flag: "w" });
            break;
        case "commit":
            const lines = final.split("\n");
            const m = `${lines.join('\n')}`;
            console.log("git commit -m", m);
            const res2 = await utils.execute("git", ["commit", ...flagPath, "-m", m]);
            console.log(res2);
            break;
        case "line":
            const firstLine = final.split("\n")[0];
            const res3 = await utils.execute("git", ["commit", ...flagPath, "-m", firstLine]);
            console.log(res3);
            break;
        default:
            console.log("Commit canceled");
            break;
    }
}

const cmd = {
    name: "commita [args...]",
    description: "Commit 2",
    options: [
        "all",
        ["--pkg <name>", "commit for a given package"],
        ["-l, --message <message>", "provide a first line message for the commit"],
    ],
    run: run
};

export { cmd };
