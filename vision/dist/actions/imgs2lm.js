import { convertImageDataToBase64 } from "@locallm/api";
import { readFile } from 'fs/promises';
import terminalImage from 'terminal-image';

// Function to read the image file and return a Buffer
async function getImageBuffer(imagePath)
{
    try {
        // Read the file asynchronously and get a Buffer
        const buffer = await readFile(imagePath);
        //console.log('Image Buffer:', buffer);
        return buffer;
    } catch (error) {
        console.error('Error reading the image file:', error);
    }
}

async function action(args, options)
{
    const isVerbose = options?.debug || options?.verbose;
    if (args.length < 1) {
        throw new Error("Provide an image path")
    }
    let prompt = " ";
    const imgData = [];
    let i = 0;
    let imgs = [];
    const lastArgIndex = args.length - 1;
    for (const arg of args) {
        if (i == lastArgIndex) {
            prompt = arg
        } else {
            let txt;
            try {
                if (isVerbose) {
                    console.log(await terminalImage.file(arg));
                }
                let data = await getImageBuffer(arg);
                txt = await convertImageDataToBase64(data);
                imgData.push(txt);
            } catch (e) {
                throw new Error(`image conversion: ${e}`)
            }
            imgs.push(`[img-${i}]`);
        }
        ++i
    }
    const im = imgs.join(" ");
    const pr = im + " " + prompt;
    return { inferParams: { images: imgData }, prompt: pr }
}

export { action }