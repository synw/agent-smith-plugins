import { writeFileSync } from "fs";
import { Command } from "commander";
import select from '@inquirer/select';
import {
    executeWorkflow,
    state,
    utils,
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
    //console.log("COMMIT OPTS", options);
    let workflowName = "git_commit";
    if (options?.msg && options?.pkg) {
        workflowName = "git_commit_pkg_details";
    } else {
        if (options?.pkg) {
            workflowName = "git_commit_pkg";
        }
        if (options?.msg) {
            workflowName = "git_commit_details";
        }
    }
    console.log("Generating a commit message ...");
    //console.log("T", workflowName);
    //console.log("ARGS", args);
    //console.log("OPTS", options)
    if (options?.instructions) {
        args["instructions"] = options.instructions;
    }
    options.onThinkingToken = (t, from) => process.stdout.write(t);
    options.onToken = (t, from) => process.stdout.write(t);
    const res = await executeWorkflow(workflowName, args, options);
    //console.log("RES", res);
    if ("error" in res) {
        console.log(res);
        throw new Error(`workflow ${workflowName} execution error: ${res.error}`);
    }
    let resp = res.text;
    if (resp.trim() == "<commit></commit>") {
        console.log("No changes found");
        return;
    }
    const final = utils.extractBetweenTags(resp, "<commit>", "</commit>");
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
            writeToClipboard(final);
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
    name: "commit [args...]",
    description: "Commit cmd",
    options: [
        "all",
        ["--pkg <name>", "commit for a given package"],
        ["--msg <name>", "the first line commit message"],
        ["--instructions <prompt>", "additionl optional instructions"]
    ],
    run: run
};

export { cmd };
