const PROJECT_PREFIX = 'roomify_project_'; 

//##             lib/puter.worker.js 2:12:05. - where we ll build our OWN REST API
// ##   2:11:00 HOSTING THE GENERATED AI IMAGE ON PUTER THEN SAVING IT INTO THE DATABASE
//          2:11:11 **setting up Puter js ServerLess Workers** 
//             serverless funcs running js code on the cloud
//             routerbased sys to handle http requests
//                 and then integrate with Puter Cloud Services like:
//                     -FILE STORAGE
//                     -KEY VALUES DATABASES
//                     -AI APIS
// ##            **In our case we re using Workers bcz public data and Cross user lookup need server side Priviliges
//                 the client SDk can only read and write the current user's private key value pairs 2:11:48
// ##            BUt the worker runs with a service context to store anf fetch piblic or shared projects for all of the users
//              lib/puter.worker.js 2:12:05
//                 where we ll define the worker routes that will call the Puter KV storage to save the porject 2:12:12


//HELPER FUNCITONS
const jsonError = (//2:13:20 create a Helper function == json error utility func 
                    status, //accepting a status
                     message,//accepting a msg
                      extra //accepting extra options
                      = {}) => { 
    return new Response(JSON.stringify({  error: message, ...extra }), { //it crafts a new response based on the stringified error
        status, //then provide additional options such as status
        headers: { //headers of content type and access-control-allow-origin allowing evg 2:14:08
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
}

//HELPER FUNCITON TO MAKE IT EASIER TO GET THE USER ID  2:14:15
const getUserId = async (userPuter) => {
    try {
        const user = await userPuter.auth.getUser();//USING THIS PUTER FUNCTION - TRY TO FETCH THE USER

        return user?.uuid || null;
    } catch { //2:14:32
        return null;
    }
}






//ROUTES CREATION
//1- SAVE THE PROJECT AT THE KEY VALUE PAR DATABASE AND SETS THE KEYS
router.post('/api/projects/save', ////2:12:16 so we create route.post that can be activated when we cann the path of  /api/projects/save'
    async ({ request, user }) => {  //open an async bloc code from we which we ll destruct the req and USER from the params 2:12:40
    try { 
        const userPuter = user.puter;

        if(!userPuter) return jsonError(401, 'Authentication failed');

        //IF WE WERE ABLE TO GRAB THE USER 2:15:20 ==>GO TO EXTARCTION PROCESS OF HIS BODY
        const body = await request.json();
                            //==>GO TO EXTARCTION PROCESS OF THE PROJECT OUR OF THE BODY 2:15:30
        const project = body?.project;

        //IF NO SUCCESS 2:15:53 2:389:15 junie modification after an error being revealed
        if(!project?.id || !project?.sourceImage) return jsonError(400, 'Project ID and source image are required');

        //IF SUCCESS 2:16:10 ==>FORM A NEW PAYLOAD CONTAINING ALL CURRENT INFO ABT THE PROJECT
        const payload = {
            ...project,//CONTAINING ALL CURRENT INFO ABT THE PROJECT
            updatedAt: new Date().toISOString(),//APPEND TO IT THE UPDATED AT FIELD
        }

        //EXTRACT HE USER ID USING THE HELPER FUNC 2:16:30
        const userId = await getUserId(userPuter);
        //CHECK 2:16:40
        if(!userId) return jsonError(401, 'Authentication failed');

        //CRAFT THE KEY UNDER WHICH WE CAN STORE IT INTO THE KEY VALUE PAIR DB 2:16:50
        //PROJECT PREFIXE DEFINED ABOVE 2:17:05 ROOMIFY_PROJECT_${project.id}
        const key = `${PROJECT_PREFIX}${project.id}`;
        //2:17:30 SET IT TO THE DATABASE
        await userPuter.kv.set(key, //UNDER THIS KEY 
                             payload); //SET THE FOLLOWING PAYLOAD

                             //RETURN IT ALL TO THE FRONT END 2:17:45
        return { saved: true,
                 id: project.id,
                project: payload }

    } catch (e) { //2:12:48 
        return jsonError(500, //form this json error utility func above
                'Failed to save project', 
                 { message: e.message || 'Unknown error' } //pass some additonal options
        );
    }
})

//2- 2:18:00 WE NEED TO ALSO GET AND LIST ALL THE KEYS
//2:18:45 USING JUNIE GENERATE 2 PUTER ROUTER ENDPOINTS 
router.get('/api/projects/list', async ({ user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const projects = (await userPuter.kv.list(PROJECT_PREFIX, true))  //GETTING THE ABOVE USER PROJECTS 2:19:17 
            .map(({value}) =>//MAP OVER THE RETURNED DATA 2:19:40
                 ({ //IMMEDIATE RETURN OF A NEW OBJECT
                        ...value, //WHERE WE RE GONNA SPREAD THE VALUE 2:19:56
                        isPublic: true }))

        return { projects };
    } catch (e) {
        return jsonError(500, 'Failed to list projects', { message: e.message || 'Unknown error' });
    }
})

//3-A GET EXTRACTING AN ID FROM THE REQ SERACH PARAMS 2:18:49 AND FETCHES THE SPECIFIC PROJECT FROM THE USE PUTER KV USING THE PREFIXE KEY
router.get('/api/projects/get', async ({ request, user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) return jsonError(400, 'Project ID is required');

        const key = `${PROJECT_PREFIX}${id}`; //2:46:40 mofification to be added const key = `${PROJECT_PREFIX}${userId}${id}`
        const project = await userPuter.kv.get(key);

        if (!project) return jsonError(404, 'Project not found');

        return { project };
    } catch (e) {
        return jsonError(500, 'Failed to get project', { message: e.message || 'Unknown error' });
    }
})
