import { imgs2base64 } from "../utils.js";

async function action (args, options)
{
    const isVerbose = options?.debug || options?.verbose;
    if (args.length < 2) {
        throw new Error("Provide an image path and a prompt");
    }
    const pr = args.pop();
    return imgs2base64(args, pr, isVerbose);

}

export { action };
