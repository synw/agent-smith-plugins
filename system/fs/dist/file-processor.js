import { promises as fs } from "fs";
import path from "path";
import { minimatch } from "minimatch";
import parseGitignore from 'parse-gitignore';
const EXT_TO_LANG = {
    py: "python",
    c: "c",
    cpp: "cpp",
    java: "java",
    js: "javascript",
    ts: "typescript",
    html: "html",
    css: "css",
    xml: "xml",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    sh: "bash",
    rb: "ruby",
};
async function processPaths(paths, options) {
    for (const path of paths) {
        await processPath(path, options);
    }
}
async function processPath(inputPath, options) {
    try {
        const stat = await fs.stat(inputPath);
        if (stat.isFile()) {
            await processFile(inputPath, options);
        }
        else if (stat.isDirectory()) {
            await traverseDirectory(inputPath, options);
        }
    }
    catch (err) {
        console.error(`Error accessing ${inputPath}: ${err}`);
    }
}
async function traverseDirectory(dirPath, options) {
    try {
        let entries = await fs.readdir(dirPath, { withFileTypes: true });
        if (!options.includeHidden) {
            entries = entries.filter(entry => !entry.name.startsWith("."));
        }
        let allIgnorePatterns = [...options.ignorePatterns];
        if (!options.ignoreGitignore) {
            const gitignorePath = path.join(dirPath, '.gitignore');
            try {
                const data = await fs.readFile(gitignorePath, 'utf-8');
                const gitignorePatterns = parseGitignore(data);
                allIgnorePatterns = [...allIgnorePatterns, ...gitignorePatterns];
            }
            catch (err) {
                if (err?.code !== 'ENOENT') {
                    console.error(`Error reading .gitignore in ${dirPath}: ${err}`);
                }
            }
        }
        entries = entries.filter(entry => {
            const entryName = entry.name;
            return !allIgnorePatterns.some(pattern => {
                const matches = minimatch(entryName, pattern);
                const isFile = entry.isFile();
                return matches && (!options.ignoreFilesOnly || isFile);
            });
        });
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                await traverseDirectory(fullPath, options);
            }
            else if (entry.isFile()) {
                const ext = path.extname(fullPath).slice(1);
                if (options.extensions.length === 0 ||
                    options.extensions.includes(ext)) {
                    await processFile(fullPath, options);
                }
            }
        }
    }
    catch (err) {
        console.error(`Error reading directory ${dirPath}: ${err}`);
    }
}
async function processFile(filePath, options) {
    try {
        const content = await fs.readFile(filePath, "utf-8");
        const formatted = formatContent(filePath, content, options);
        console.log(formatted);
    }
    catch (err) {
        console.error(`Error reading ${filePath}: ${err}`);
    }
}
function formatContent(filePath, content, options) {
    if (options.lineNumbers) {
        content = addLineNumbers(content);
    }
    if (options.markdown) {
        return formatAsMarkdown(filePath, content);
    }
    else {
        return formatDefault(filePath, content);
    }
}
function formatDefault(filePath, content) {
    return [
        filePath,
        "---",
        content,
        "---"
    ].join("\n");
}
function formatAsMarkdown(filePath, content) {
    const lang = EXT_TO_LANG[path.extname(filePath).slice(1)] || "";
    const backticks = getBacktickWrapper(content);
    return [
        filePath,
        `${backticks}${lang}`,
        content,
        backticks
    ].join("\n");
}
function getBacktickWrapper(content) {
    let wrapper = "```";
    while (content.includes(wrapper)) {
        wrapper += "`";
    }
    return wrapper;
}
function addLineNumbers(content) {
    const lines = content.split("\n");
    const maxDigits = String(lines.length).length;
    return lines.map((line, i) => `${(i + 1).toString().padStart(maxDigits)}  ${line}`).join("\n");
}
export { processPaths, };
