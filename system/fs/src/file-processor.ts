import { promises as fs } from "fs";
import path from "path";
import { minimatch } from "minimatch";
// @ts-ignore
import parseGitignore from 'parse-gitignore';

const EXT_TO_LANG: Record<string, string> = {
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

async function processPaths(
  paths: string[],
  options: {
    extensions: string[];
    includeHidden: boolean;
    ignoreFilesOnly: boolean;
    ignoreGitignore: boolean;
    ignorePatterns: string[];
    markdown: boolean;
    lineNumbers: boolean;
  }
) {
  for (const path of paths) {
    await processPath(path, options);
  }
}

async function processPath(
  inputPath: string,
  options: any
) {
  try {
    //console.log("PP", inputPath, options)
    const stat = await fs.stat(inputPath);

    if (stat.isFile()) {
      await processFile(inputPath, options);
    } else if (stat.isDirectory()) {
      await traverseDirectory(inputPath, options);
    }
  } catch (err) {
    console.error(`Error accessing ${inputPath}: ${err}`);
  }
}

async function traverseDirectory(
  dirPath: string,
  options: any
) {
  try {
    let entries = await fs.readdir(dirPath, { withFileTypes: true });

    // Filter out hidden files/directories if not included
    if (!options.includeHidden) {
      entries = entries.filter(entry => !entry.name.startsWith("."));
    }

    // Collect ignore patterns from command line and .gitignore
    let allIgnorePatterns = [...options.ignorePatterns]; // Start with command-line patterns

    // Add .gitignore patterns if not disabled
    if (!options.ignoreGitignore) {
      const gitignorePath = path.join(dirPath, '.gitignore');
      try {
        const data = await fs.readFile(gitignorePath, 'utf-8');
        const gitignorePatterns = parseGitignore(data);
        allIgnorePatterns = [...allIgnorePatterns, ...gitignorePatterns];
      } catch (err: any) {
        if (err?.code !== 'ENOENT') {
          console.error(`Error reading .gitignore in ${dirPath}: ${err}`);
        }
      }
    }

    // Filter entries using combined patterns
    entries = entries.filter(entry => {
      const entryName = entry.name;
      return !allIgnorePatterns.some(pattern => {
        const matches = minimatch(entryName, pattern);
        const isFile = entry.isFile();
        return matches && (!options.ignoreFilesOnly || isFile);
      });
    });

    // Process files and directories
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        await traverseDirectory(fullPath, options);
      } else if (entry.isFile()) {
        // Fix: Remove the leading '.' from the extension before checking
        const ext = path.extname(fullPath).slice(1);
        //console.log("EXT", ext, "/", options.extensions)
        if (options.extensions.length === 0 ||
          options.extensions.includes(ext)) {
          await processFile(fullPath, options);
        }
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dirPath}: ${err}`);
  }
}

async function processFile(
  filePath: string,
  options: any
) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const formatted = formatContent(filePath, content, options);
    console.log(formatted);
  } catch (err) {
    console.error(`Error reading ${filePath}: ${err}`);
  }
}

function formatContent(
  filePath: string,
  content: string,
  options: any
) {
  if (options.lineNumbers) {
    content = addLineNumbers(content);
  }

  if (options.markdown) {
    return formatAsMarkdown(filePath, content);
  } else {
    return formatDefault(filePath, content);
  }
}

function formatDefault(filePath: string, content: string) {
  return [
    filePath,
    "---",
    content,
    "---"
  ].join("\n");
}

function formatAsMarkdown(filePath: string, content: string) {
  const lang = EXT_TO_LANG[path.extname(filePath).slice(1)] || "";
  const backticks = getBacktickWrapper(content);
  return [
    filePath,
    `${backticks}${lang}`,
    content,
    backticks
  ].join("\n");
}

function getBacktickWrapper(content: string) {
  let wrapper = "```";
  while (content.includes(wrapper)) {
    wrapper += "`";
  }
  return wrapper;
}

function addLineNumbers(content: string) {
  const lines = content.split("\n");
  const maxDigits = String(lines.length).length;
  return lines.map((line, i) =>
    `${(i + 1).toString().padStart(maxDigits)}  ${line}`
  ).join("\n");
}

export {
  processPaths,
}