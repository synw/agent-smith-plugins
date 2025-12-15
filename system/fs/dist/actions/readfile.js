import fs from 'fs/promises';

async function action(args, options)
{
    let fp = "";
    if (Array.isArray(args)) {
        fp = args[0]
    } else {
        if (!typeof args == "string") {
            throw new Error("readfile action: input an array or string as parameter")
        }
        fp = args;
    }
    //console.log("RF FP", fp);
    try {
        const content = await fs.readFile(fp, 'utf8');
        return content;
    } catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
    }
}

export { action }