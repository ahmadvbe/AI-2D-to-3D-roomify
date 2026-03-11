import puter from "@heyputer/puter.js";
import {ROOMIFY_RENDER_PROMPT} from "./constants";


                // create a func fetchAsDataUrl 1:49:!4 taking the URL
                //  and turn it into Base 64 string 1:49:10 @ lib/ai.action.ts
export const fetchAsDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const blob = await response.blob(); //convert the response intoa. blob

  return new Promise((resolve, reject) => {//create a new promise using a file reader to read the blob
    //as a data url amd resolves with a result or rejects with error 
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

//1:50:33 using the file extracted above 
//  - 2:06:55 take the old image-take the prompt provided to puter run it against a model we hve chosen and output the 3D floor plan
export const generate3DView = async ({ sourceImage }: Generate3DViewParams) => {
  //2:08:20 throughout this process we hve never craeted api keys on Gemini, Open AI or ny kind of DB or Authentication Solution
  //in this case is acting as our full on backend replacinf our auth provider,
  //  the DB with their key Value storage, the AI providers and asll sorts of diff APIs
  //all within ont tool that u didnt hve to enter the credit card for 
  console.log("lib/ai.action.ts/generate 3d function has begun working")
    const dataUrl = sourceImage.startsWith('data:') //ensure that we hve the image into the data file format
        ? sourceImage
        : await fetchAsDataUrl(sourceImage);

    const base64Data = dataUrl.split(',')[1]; //get the 2nd part of it and assign it to base64 1:51:20
    const mimeType = dataUrl.split(';')[0] //get the 1st part of it  -- type of the image
                          .split(':')[1];

    if(!mimeType || !base64Data) throw new Error('Invalid source image payload');//1:51:55

    //if we hve properly extracted this src image =>generate a response
    const response = await puter.ai.txt2img(
      ROOMIFY_RENDER_PROMPT, //1st param required 1:53:30
      { //2nd param options object
        provider: "gemini",
        model: "gemini-2.5-flash-image-preview",
        input_image: base64Data,
        input_image_mime_type: mimeType,
        ratio: { w: 1024, h: 1024 },
    });
    console.log(" lib/ai.action.ts/generate3DView/response generate by puter using the Prompt", response)

    //1:54:20
    const rawImageUrl = (response as HTMLImageElement).src ?? null;

    console.log(" lib/ai.action.ts/generate3DView/raw image url", rawImageUrl)
    if (!rawImageUrl) 
          return { renderedImage: null,
                   renderedPath: undefined };

                   //but if we hve the rawImageUrl we can return it
    const renderedImage = rawImageUrl.startsWith('data:')
            ? rawImageUrl :
              await fetchAsDataUrl(rawImageUrl);

    return { renderedImage, //1:55:30
             renderedPath: undefined };
}
