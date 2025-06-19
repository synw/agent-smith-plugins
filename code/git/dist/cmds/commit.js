import { writeFileSync } from "fs";
import { Command } from "commander";
import select from '@inquirer/select';
import {
    execute,
    executeWorkflow,
    writeToClipboard,
    initAgent,
    initState,
    extractBetweenTags,
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

async function runCmd(args, options) {
    await initState();
    const isUp = await initAgent();
    if (!isUp) {
        throw new Error("No inference server found, canceling")
    }
    let taskName = "git_commit";
    if (options?.pkg) {
        taskName = "git_commit_pkg";
        //options.vars = ["pkg", options.pkg]
    } else if (options?.message) {
        //options.vars = ["message", options.message]
        taskName = "git_commit_details";
    }
    console.log("Generating a commit message ...");
    //console.log("T", taskName);
    //console.log("ARGS", args);
    //console.log("OPTS", options)
    const res = await executeWorkflow(taskName, args, options);
    //console.log("RES", res);
    if ("error" in res) {
        console.log(res);
        throw new Error(`workflow ${taskName} execution error: ${res.error}`)
    }
    let resp = res.answer.text;
    if (res.template.tags?.think) {
        const sresp = res.answer.text.split(res.template.tags.think.end);
        resp = sresp.length == 1 ? sresp[0] : sresp[1];
    }
    const final = extractBetweenTags(resp, "<commit>", "</commit>");
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
            writeToClipboard(final)
            break;
        case "file":
            const tmpFile = process.cwd() + "/tmp.txt";
            writeFileSync(tmpFile, final, { flag: "w" });
            break;
        case "commit":
            const lines = final.split("\n");
            const m = `${lines.join('\n')}`;
            console.log("git commit -m", m);
            const res2 = await execute("git", ["commit", ...flagPath, "-m", m]);
            console.log(res2);
            break;
        case "line":
            const firstLine = final.split("\n")[0];
            const res3 = await execute("git", ["commit", ...flagPath, "-m", firstLine]);
            console.log(res3);
            break;
        default:
            console.log("Commit canceled");
            break;
    }
}

const cmd = new Command("commit")
    .argument("[args...]")
    .description("Create a git commit message from a git diff")
    .option("--pkg <name>", "commit for a given package")
    .option("-l, --message <message>", "provide a first line message for the commit")
    .action((..._args) => {
        const { args, options } = parseCommandArgs(_args)
        runCmd(args, options)
    });
allOptions.forEach(o => cmd.addOption(o))

export { cmd };
