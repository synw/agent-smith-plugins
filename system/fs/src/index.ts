import { Command } from "commander";
import { processPaths } from "./file-processor.js";

async function main() {
    const program = new Command();

    program
        .version("1.0.0")
        .argument("[paths...]", "Paths to process")
        // @ts-ignore
        .option("-e, --extension <ext>", "File extensions to include", (v, arr) => {
            return [...arr, v];
        }, [])
        .option("--include-hidden", "Include hidden files/directories")
        .option("--ignore-files-only", "Only ignore files (not directories) with --ignore")
        .option("--ignore-gitignore", "Disable .gitignore processing")
        // @ts-ignore
        .option("--ignore <pattern>", "Files/directories to ignore", (v, arr) => {
            return [...arr, v];
        }, [])
        .option("-m, --markdown", "Output as Markdown code blocks")
        .option("-n, --line-numbers", "Add line numbers to output")
        .parse(process.argv)
    const options = program.opts();
    const opts = {
        extensions: options.extension,
        includeHidden: options.includeHidden,
        ignoreFilesOnly: options.ignoreFilesOnly,
        ignoreGitignore: options.ignoreGitignore,
        ignorePatterns: options.ignore,
        markdown: options.markdown,
        lineNumbers: options.lineNumbers
    };
    console.log("OPTS", opts); -
        await processPaths(program.args, opts);
    //await program.parseAsync(process.argv);
}


(async () => {
    await main()
})();