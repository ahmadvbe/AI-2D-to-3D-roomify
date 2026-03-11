import { useLocation, useNavigate, useOutletContext, useParams} from "react-router";
import {useEffect, useRef, useState} from "react";
import {generate3DView} from "../../lib/ai.action";
import {Box, Download, RefreshCcw, Share2, X} from "lucide-react";
import Button from "../../components/ui/Button";
import {createProject, 
        getProjectById
    } from "../../lib/puter.action";
// import {ReactCompareSlider, ReactCompareSliderImage} from "react-compare-slider";

            // 59:28 VISUALIZE THE UPLOADED FILE
            //     app/routes/visualizer.$id.tsx
const VisualizerId = () => {
    const { id } = useParams(); //get access to that state we pass into the new page 2:31:40 extract the id of the project we re currently checking 
    const { userId } = useOutletContext<AuthContext>() //2:31:55   then we extract also the userId 
    // then we create the snipped state of Project and setProject, isPojectloading, setIsProjectLoading

    const navigate = useNavigate();//1:55:45 in case we need to renavigate back to home
    // const location = useLocation()
    // const {initialImage, initialRender, name} = location.state || {} //2:32:50 no need for location satte anymore becz we ll be uing the data coming from the BE
    //console.log("initial image", initialImage)
 
    

    const hasInitialGenerated = useRef(false); //1:55:53

   
    const [project, setProject] = useState<DesignItem | null>(null); //2:32:10 bcz its null at the state so we add a null as a type also
    const [isProjectLoading, setIsProjectLoading] = useState(true); //2:32:30

     //add additional useStates 1:56:10
    const [isProcessing, setIsProcessing] = useState(false);

    //and in the currentImage we wont be updating it from the initialRender <string | null>(initialRender || null);
    //we ll be uing the data coming from the BE
    const [currentImage, setCurrentImage] = useState<string | null>(null);

    const handleBack = () => navigate('/'); //1:57:00 nav back to home

    const handleExport = () => {
        if (!currentImage) return;

        const link = document.createElement('a');
        link.href = currentImage;
        link.download = `roomify-${id || 'design'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

     //1:57:10 where we ll call the generate3DView created @lib/ai.action.ts here
    const runGeneration = async (
         item: DesignItem//but rather we ll get an item as input to this function 2:33:05
    ) => {
        
        //console.log("app/routes/visualizer.$id.tsx/runGeneration has begun working")
        //if(!initialImage) return//2:33:00  we no longer hve this initial image coming from the state we re passing from the home page
        //but rather we ll get an item as input to this function 2:33:15
        if(!id || !item.sourceImage) return; 


        try { //if we do we ll try to genertae the 3d view
            setIsProcessing(true); //display sort of loading 1:57:33
                //extract the result out of the call
            const result = await generate3DView({ sourceImage: 
                                        //initialImage //1:57:50
                          item.sourceImage  //2:33:20 update it from intialImage to data coming from our BackEnd
                        }); 

                console.log("app/routes/visualizer.$id.tsx/generate3DView/renderedImage", result)

            if(result.renderedImage) { //if we get back a result we set it to the state 1:58:00
                setCurrentImage(result.renderedImage);

                //once we get this image we ll also hve to update 1:58:05 the project in the DB with the rendered image
                // 2:33:30 updating process
                const updatedItem = { //object 
                    ...item, //first spread the initial item data
                    renderedImage: result.renderedImage, //append the renderedImage to it 2:33:50
                    renderedPath: result.renderedPath,
                    timestamp: Date.now(),
                    ownerId: item.ownerId ?? userId ?? null,
                    isPublic: item.isPublic ?? false,
                }
                   // 2:34:25 2nd call of the create project action
                const saved = await createProject({ item: updatedItem, 
                                                    visibility: "private" })

                if(saved) { //2:34:47 if project is properly saved
                    setProject(saved); //set it to the state
                    setCurrentImage(saved.renderedImage || result.renderedImage);//set it to the state
                }
            }
        } catch (error) { //1:58:30
            console.error('Generation failed: ', error)
        } finally {
            setIsProcessing(false); //in all cases whther it succeeded or fails
        }
    }

    //2:35:07 use of useEffect to make sure that evg is updated so that we ensure our projects get displayed properly
    useEffect(() => { 
        let isMounted = true; //check whetehr the component has mounted

        const loadProject = async () => {
            if (!id) {
                setIsProjectLoading(false); //set the project loading to false at the start if it doesnt exist
                return;
            }
                //but if it does exist 2:35:38
            setIsProjectLoading(true);
                //fetched the current project
            const fetchedProject = await getProjectById({ id });

            if (!isMounted) return;

            //set to states 2:35:50    
            setProject(fetchedProject);
            setCurrentImage(fetchedProject?.renderedImage || null);
            setIsProjectLoading(false);
            hasInitialGenerated.current = false;
        };

        //we simply call it 2:35:58
        loadProject();

        return () => { //unmount
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {//1:58:50 keep track of the changes //2:36:00 checking whther smtg goes wrong
        // console.log("app/routes/visualizer.$id.tsx -- use effect is working")
        // console.log("app/routes/visualizer.$id.tsx --initialImage",initialImage)
        // console.log("app/routes/visualizer.$id.tsx -- hasInitialGenerated.current=",hasInitialGenerated.current)
        // console.log("app/routes/visualizer.$id.tsx -- !project?.sourceImage= ", !project?.sourceImage )
        // console.log("app/routes/visualizer.$id.tsx --initialImage",initialImage)

       // if(!initialImage || hasInitialGenerated.current) return //1:59:05
        if ( //2:36:05
            isProjectLoading ||
            hasInitialGenerated.current || !project?.sourceImage ) return;
       

         //console.log("app/routes/visualizer.$id.tsx -- initialRender", initialRender)
        // if(initialRender){ //1:59:15
        //     setCurrentImage(initialRender)
        //     hasInitialGenerated.current = true; //update the ref
        //     return; //1:59:30
        // }
        if (project.renderedImage) { //2:36:10
            setCurrentImage(project.renderedImage);//update the image to be the rendered one
            hasInitialGenerated.current = true; //update the ref
            return; //1:59:30
        }
        

        hasInitialGenerated.current = true; //update the initialRef 1:59:33
        void runGeneration(project);
        //void runGeneration();
    }, //[initialImage, initialRender]) //1:58:55
        [project, isProjectLoading]);

    return ( //1:59:50 start displaying the vizualizer
        <div className="visualizer">
            <nav  //2:01:00
                className="topbar">
                <div 
                    className="brand">
                    <Box className="logo" />

                    <span className="name">Roomify</span>
                </div>
                <Button //2:01:45 REUSABLE BUTTON COMPONENT 
                    variant="ghost"
                    size="sm" 
                    onClick={handleBack}
                    className="exit">
                    <X className="icon" /> Exit Editor
                </Button>
            </nav>

            <section //2:02:25  2:36:20
                className="content">
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>Project</p>
                            <h2>{project?.name || `Residence ${id}`}</h2>
                            <p className="note">Created by You</p>
                        </div>

                        <div //2:03:33
                            className="panel-actions">
                            <Button
                                size="sm"
                                onClick={handleExport}
                                className="export"
                                disabled={!currentImage} //IF WE DNT HAVE A CURRENT IMAGE
                            >
                                <Download   //2:04:01
                                    className="w-4 h-4 mr-2" /> Export
                            </Button>

                            <Button  //2:04:05
                                size="sm" 
                                onClick={() => {}} className="share">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>

                        </div>
                    </div>

                    <div  //DISPLAY THE IMAGES WE HVE 2:04:30
                        className={`render-area ${isProcessing ? 'is-processing': ''}`}>
                        {currentImage ? ( //IF A CURRENT IMAGE EIXSTS
                            <img //2:05:00
                                src={currentImage} 
                                alt="AI Render" 
                                className="render-img" />
                        ) : ( //ESLE 2:05:12 if current image doesnt exists 
                            <div className="render-placeholder">
                                {project?.sourceImage
                                //initialImage //2:05:25
                                 && ( //check whether w ehve access to the source initial image
                                    <img 
                                        //src={initialImage} //2:05:34
                                        src={project?.sourceImage} //2:36:40
                                        alt="Original" 
                                        className="render-fallback" />
                                )}
                            </div>
                        )}

                        {isProcessing && ( //2:05:50 if we re currenlty processign this AI image  =>OVERLAY DISPLAY 
                            <div 
                                className="render-overlay">
                                <div className="rendering-card">
                                    <RefreshCcw className="spinner" />
                                    <span className="title">Rendering...</span>
                                    <span className="subtitle">Generating your 3D visualization</span>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                <div className="panel compare">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>Comparison</p>
                            <h3>Before and After</h3>
                        </div>
                        <div className="hint">Drag to compare</div>
                    </div>

                    <div className="compare-stage">
                        {/* {project?.sourceImage && currentImage ? (
                            <ReactCompareSlider
                                defaultValue={50}
                                style={{ width: '100%', height: 'auto' }}
                                itemOne={
                                    <ReactCompareSliderImage src={project?.sourceImage} alt="before" className="compare-img" />
                                }
                                itemTwo={
                                    <ReactCompareSliderImage src={currentImage || project?.renderedImage} alt="after" className="compare-img" />
                                }
                            />
                        ) : (
                            <div className="compare-fallback">
                                {project?.sourceImage && (
                                    <img src={project.sourceImage} alt="Before" className="compare-img" />
                                )}
                            </div>
                        )} */}
                    </div>
                </div>
            </section>
        </div>
    )
}
export default VisualizerId
