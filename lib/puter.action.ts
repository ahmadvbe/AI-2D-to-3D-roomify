import puter from "@heyputer/puter.js";
import {getOrCreateHostingConfig, uploadImageToHosting} from "./puter.hosting";
import {isHostedUrl} from "./utils";
import {PUTER_WORKER_URL} from "./constants";

///23:30. implementing all the actions provided by PUTER

export const signIn = async () => await puter.auth.signIn(); //23:44

export const signOut = () => puter.auth.signOut(); //24:00 not an async func - no await

export const getCurrentUser = async () => { //24:10 helper function
    try {
        return await puter.auth.getUser();
    } catch {
        return null;
    }
}

//  1:26:12 now we hve to use the function uploadImageToHosting
//  created  within the lib/puter.hosting.ts within the lib/puter.action.ts **createProject function**
//the project function should take all the info and the image and store it to key value DB
export const createProject = async ({  //1:27:15 object cntaining
            item, //info abt project 
            visibility = "private" }
     : CreateProjectParams):
      Promise<DesignItem | null | undefined> => { //return a promise which get resolved into
    if(!PUTER_WORKER_URL) {
        console.warn('Missing VITE_PUTER_WORKER_URL; skip history fetch;');
        return null;
    }
    const projectId = item.id; //1:27:58

    const hosting = await getOrCreateHostingConfig(); //get access ot the hosting -- lib/puter.hosting.ts


             //WE NEED TO HVE THE BEFORE AND AFTER IMAGES

    const hostedSource = projectId ? //get access ot the hosted project 
            // using the helper func created at lib/puter.hosting.ts
        await uploadImageToHosting({ 
            hosting,
            url: item.sourceImage,
            projectId,
            label: 'source', }) :
                                 null; //or if we dnt hve the projectId there is ntg to host

                                    //1:28:44
    const hostedRender = projectId && item.renderedImage ?
        await uploadImageToHosting({ 
            hosting,
            url: item.renderedImage, //nt the source image rather the renderdone
            projectId,
             label: 'rendered', }) : 
                                    null;
            //WE NEED TO HVE THE BEFORE AND AFTER IMAGES 1:29:20

            //NOW WE NEED TO RESOLVE IT 1:29:40
    const resolvedSource = hostedSource?.url || 
    (isHostedUrl(item.sourceImage) ? item.sourceImage
                                     : ''
    );

            //1:30:06  
    if(!resolvedSource) {
        console.warn('Failed to host source image, skipping save.')
        return null;
    }

    //1:30:25 GET ACCESS TO THE RESOLVED RENDER
    const resolvedRender = hostedRender?.url
        ? hostedRender?.url
        : item.renderedImage && isHostedUrl(item.renderedImage)
            ? item.renderedImage
            : undefined;


            //1:31:18 FORM A NEW OBJECT THAT HAS TO LOOK LIKE THE DESIGN ITEM 
            //CONTAINING ALL OF TIS PROPERTIES 1:31:30
    const { //DESTRUCT SOME VAR FROM the item
        sourcePath: _sourcePath, //reanem to 
        renderedPath: _renderedPath, //rename to 
        publicPath: _publicPath,
        ...rest //spread the rest of the values rh 
    } = item; //coming from the item

    const payload = { //once we spread all of that we
    //  only need to get the one we think they r useful for the desgin item
    //by forming them into an object payload which we will send to Puter
        ...rest,
        sourceImage: resolvedSource, //set to resolvedSource
        renderedImage: resolvedRender,
    }

    try { //1:32:22
        //1:32:38 call the Puter Worker to store the project in KV
        //key value DB
        return payload //test is done here 1:32:56 test 
        // it out and check whether we can get this payload out
        //and we will call this function createProject in our app/routes/home.tsx


        // const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/save`, {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         project: payload,
        //         visibility
        //     })
        // });

        // if(!response.ok) {
        //     console.error('failed to save the project', await response.text());
        //     return null;
        // }

        // const data = (await response.json()) as { project?: DesignItem | null }

        // return data?.project ?? null;
    } catch (e) { //1:32:26
        console.log('Failed to save project', e)
        return null;
    }
}

export const getProjects = async () => {
    if(!PUTER_WORKER_URL) {
        console.warn('Missing VITE_PUTER_WORKER_URL; skip history fetch;');
        return []
    }

    try {
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/list`, { method: 'GET' });

        if(!response.ok) {
            console.error('Failed to fetch history', await response.text());
            return [];
        }

        const data = (await response.json()) as { projects?: DesignItem[] | null };

        return Array.isArray(data?.projects) ? data?.projects : [];
    } catch (e) {
        console.error('Failed to get projects', e);
        return [];
    }
}

export const getProjectById = async ({ id }: { id: string }) => {
    if (!PUTER_WORKER_URL) {
        console.warn("Missing VITE_PUTER_WORKER_URL; skipping project fetch.");
        return null;
    }

    console.log("Fetching project with ID:", id);

    try {
        const response = await puter.workers.exec(
            `${PUTER_WORKER_URL}/api/projects/get?id=${encodeURIComponent(id)}`,
            { method: "GET" },
        );

        console.log("Fetch project response:", response);

        if (!response.ok) {
            console.error("Failed to fetch project:", await response.text());
            return null;
        }

        const data = (await response.json()) as {
            project?: DesignItem | null;
        };

        console.log("Fetched project data:", data);

        return data?.project ?? null;
    } catch (error) {
        console.error("Failed to fetch project:", error);
        return null;
    }
};
