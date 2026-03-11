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

    if(!PUTER_WORKER_URL) { //2:27:00
        console.warn('Missing VITE_PUTER_WORKER_URL; skip history fetch;');
        return null;
    }


    const projectId = item.id; //1:27:58
         console.log("lib/puter.action.ts, iTem", item)
         console.log("lib/puter.action.ts, Project ID", projectId)
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
            //console.log("lib/puter.action.ts, item.sourceImage", item.sourceImage)
            console.log("lib/puter.action.ts, BeforeImage=hostedSource", hostedSource)
                                    //1:28:44
            
    const hostedRender = projectId && item.renderedImage ?
        await uploadImageToHosting({ 
            hosting,
            url: item.renderedImage, //nt the source image rather the renderd image
            projectId,
             label: 'rendered', }) : 
                                    null;
            //WE NEED TO HVE THE BEFORE AND AFTER IMAGES 1:29:20
            console.log("lib/puter.action.ts, item.renderedImage", item.renderedImage)
            console.log("lib/puter.action.ts, RenderedImage=hostedRender", hostedRender)

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
    console.log("lib/puter.action.ts, resolvedSource", resolvedSource)

    //1:30:25 GET ACCESS TO THE RESOLVED RENDER
    const resolvedRender = hostedRender?.url
        ? hostedRender?.url
        : item.renderedImage && isHostedUrl(item.renderedImage)
            ? item.renderedImage
            : undefined;
    console.log("lib/puter.action.ts, resolvedRender", resolvedRender)

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
        //1:32:38 call the Puter Worker to store the project in KV 2:27:50 key value DB
        // CALL AN ACTION FROM OUR BACKEND URL
        
        
        // it out and check whether we can get this payload out
        //and we will call this function createProject in our app/routes/home.tsx


        //2:28:15 call our worker 2:38:15 Junie modifications done to prevent an error
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/save`, {
            method: 'POST',
            body: JSON.stringify({ //2:28:25
                project: payload,
                visibility //which we get as a 2nd param on the beginning of the func
            })
        });

        if(!response.ok) { //2:29:10 if not saved
            console.error('failed to save the project', await response.text());
            return null;
        }

        //if saved correctly 2:29:30 =>extract the data from it     
         const data = (await response.json()) as { project?: DesignItem | null } //as a project of DesingItem not an array type

         //return payload //test is done here 1:32:56 test 
         return data?.project ?? null;
    } catch (e) { //1:32:26
        console.log('Failed to save project', e)
        return null;
    }
}


// ## 2:21:50 DISPLAY THE DATA
//     lib/puter.action.ts 2:22:00 CREATE THE FUNCTION - ALLOWING US TO LIST THE PROJECTS SOTRED IN THE KV STORAGE VIA  THE WORKER ROUTES
export const getProjects = async () => { //2:22:15
    if(!PUTER_WORKER_URL) { //COMING FROM CONSTANS WHICH IS DERIVED FROM OUR ENVS .env.local.  2:22:50
        console.warn('Missing VITE_PUTER_WORKER_URL; skip history fetch;');
        return []
    }

        //2:23:00
    try {  //2:23:22
        const response = await puter.workers.exec(//EXECUSTE THE FOLLOWING FUNC WITH THE PUTER WORKER 2:23:37 
            `${PUTER_WORKER_URL}/api/projects/list`, //WE RE CALLING OUR BE 2:24:05
             { method: 'GET' });//WITH A METHOD OF GET 

        if(!response.ok) { //2:24:15 CHECK 
            console.error('Failed to fetch history', 
                            await response.text()
                        );
            return [];
        }

        //ELSE IF RESPONSE IS OKAY 2:24:38
        //EXTRACT HE DATA FROM THE RESPONSE
        const data = (await response.json()) as { projects?: DesignItem[] | null }; //ITS GONNA BE A LIST OF DIFF DesignItem 2:25:00

        return Array.isArray(data?.projects) ? data?.projects : [];
    } catch (e) { //2:23:10
        console.error('Failed to get projects', e);
        return [];
    }
}


//Lets create the getPorject by ID action within 2:30:30 within the lib/puter.action.ts

export const getProjectById = async ({ id }: { id: string }) => { //2:30:52
    if (!PUTER_WORKER_URL) {
        console.warn("Missing VITE_PUTER_WORKER_URL; skipping project fetch.");
        return null;
    }

    console.log("lib/puter.action.ts/Fetching project with ID:", id);

    try { //calla nother one of our endpoint within our worker and pass in the ID 2:31:00
        const response = await puter.workers.exec(
            `${PUTER_WORKER_URL}/api/projects/get?id=${encodeURIComponent(id)}`,
            { method: "GET" },
        );

        console.log("lib/puter.action.ts/getprojectbyID/Fetch project response:", response);

        if (!response.ok) { //we do some error handling
            console.error("Failed to fetch project:", await response.text());
            return null;
        }

        //data extraction 2:31:09
        const data = (await response.json()) as {
            project?: DesignItem | null;
        };

        console.log("lib/puter.action.ts/getprojectbyID/Fetched project data:", data);

        return data?.project ?? null;
    } catch (error) {
        console.error("Failed to fetch project:", error);
        return null;
    }
};
