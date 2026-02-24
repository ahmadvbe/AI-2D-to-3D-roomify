import puter from "@heyputer/puter.js";
import {
    createHostingSlug,
    fetchBlobFromUrl, getHostedUrl,
    getImageExtension,
    HOSTING_CONFIG_KEY,
    imageUrlToPngBlob,
    isHostedUrl
} from "./utils";

// ##           1:12:20  lib/puter.hosting.ts
//  ##               this file will handle the upload of the images   TO THE PUTER HOSTED DOMAIN
//     WE NEED TO CREATE A FUNCTION THAT CHECKS IF A SUBDOMAIN IS PRESENT IN. THE KEY VALUE STORE PUTER'S DATABASE
//IF NOT IT NEEDS TO CRAETE A NEW ONE AND THEN STORE THATR SUBDOMIAN IN THE KEY VALUE PAIRS

export const getOrCreateHostingConfig = async (): Promise<HostingConfig | null> => { //11:12:55 
            // AN ASYNC FUNCTION THAT WILL RETURN A PROMISE WHICH WILL RESOLVE IN THE HOSTING CONFIG or null 
            //this hostingconfig type will be craeted @ type.d.ts

            //try to get access to the existing DB 1:13:38 or a chain to key value pairs coming from Puter
    const existing = (await puter.kv.get(HOSTING_CONFIG_KEY)) as HostingConfig | null; //1:13:50 config key created @ lib/utils.ts
    //  1:14:50 pass the hosting key from utils

    //1:15:07 check whether a asubdomain exisst
    if(existing?.subdomain) 
            return { subdomain: existing.subdomain };


        //if not existing
    const subdomain = createHostingSlug(); //FUNC created within the lib/utils.ts 1:16:26
        //once subdomain is created we can actually create a new Puter Hosting
    try { 
        const created = await puter.hosting.create(subdomain, '.');//2nd param is a directory path
        // . : to be done in the current directory

        const record = { subdomain: created.subdomain };//get access to the record
        // --set the record to created.subdomain

        await puter.kv.set(HOSTING_CONFIG_KEY, record);

            return record;

    } catch (e) { //1:16:42
        console.warn(`Could not find subdomain: ${e}`);
        return null;
    }
}

    //1:17:56 implement an upload FUNC takies Blobs or basic 64 strings 
            // and uploads them on the computer subdomain
            //upload images to our File Storage proovided by Puter
export const uploadImageToHosting = async ({ //asyn func accepting a coouple of params
                hosting,
                url,
                projectId,
                label }: 
                StoreHostedImageParams)://those will be. of a type 1:19:02
                 Promise<HostedAsset | null> => //return a promise that will resolve in a HostedAsset type
                    { //opne up a func block

    if(!hosting || !url) return null; //1:29=0:50 if there is no hosting =>without that we cant upload
    
    if(isHostedUrl(url)) return { url }; //1:21:00

    try { //if all is ok 1:21:38 we ll ressolve the transformation of the image from the url to a png
        const resolved = label === "rendered" //1:21:48
            ? await imageUrlToPngBlob(url) //await the transformation 
                .then((blob) => blob ? //if blob exists then return an object containing the 
                        { blob, 
                          contentType: 'image/png' }: //else
                                         null) 
            : await fetchBlobFromUrl(url); //if its not rendered rn 1:22:40

        if(!resolved) return null; //1:22:52

        //if we hve resolved the image that we hve uploaded  1:23:02 
                     // =>get access to its content typ
        const contentType = resolved.contentType || resolved.blob.type || '';
            //get image extension 1:23:30
        const ext = getImageExtension(contentType, url); 
                //extract the directory 1:23:42
        const dir = `projects/${projectId}`; //the image will be stored here
                //combining all of the above into a final file path 1:24:00
        const filePath = `${dir}/${label}.${ext}`;
                //figure out which file we wana upload=>
                        // create a new file out of the blobsss we hve access to
        const uploadFile = new File(
             [resolved.blob],
             `${label}.${ext}`, //2nd param sfile name
             {type: contentType,} //3rd param 1:24:33
            );

            //1:24:42 use of Puter to upload it
        await puter.fs.mkdir(dir, 
                { createMissingParents: true }); //in case we re creating this dir foe the 1st time
        await puter.fs. //again entering the file system but this time 
                write(filePath, //we re gona write smtg to the following file path it 
             uploadFile); //the data that we re gonna add 1:25:15

             //this will gives us access to the hosted url of the uploaded image
        const hostedUrl = getHostedUrl(
            { subdomain: hosting.subdomain },//define the subdomain 1"25"36
             filePath //know exactly where it iss coming from
            );

        return hostedUrl ? //1:25:45
                        { url: hostedUrl } ://url is set to hosted url is it exists
                         null;
    } catch (e) {//1:21:15 warn abt th error
        console.warn(`Failed to store hosted image: ${e}`);
        return null;
    }
}
