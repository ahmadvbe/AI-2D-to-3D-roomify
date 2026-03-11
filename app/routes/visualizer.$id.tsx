import { useLocation, useNavigate, useOutletContext, useParams} from "react-router";
import {useEffect, useRef, useState} from "react";
import {generate3DView} from "../../lib/ai.action";
import {Box, Download, RefreshCcw, Share2, X} from "lucide-react";
import Button from "../../components/ui/Button";
// import {createProject, 
//         //getProjectById
//     } from "../../lib/puter.action";
// import {ReactCompareSlider, ReactCompareSliderImage} from "react-compare-slider";

            // 59:28 VISUALIZE THE UPLOADED FILE
            //     app/routes/visualizer.$id.tsx
const VisualizerId = () => {
    const { id } = useParams(); //get access to that state we pass into the new page

    const navigate = useNavigate();//1:55:45 in case we need to renavigate back to home
    const location = useLocation()
    const {initialImage, initialRender, name} = location.state || {} 
    console.log("initial image", initialImage)
 
    const { userId } = useOutletContext<AuthContext>()

    const hasInitialGenerated = useRef(false); //1:55:53

   
    const [project, setProject] = useState<DesignItem | null>(null);
    const [isProjectLoading, setIsProjectLoading] = useState(true);

     //add additional useStates 1:56:10
    const [isProcessing, setIsProcessing] = useState(false);
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
         //item: DesignItem
    ) => {
        //if(!id || !item.sourceImage) return; //check whether we hve access to the initial image
        //console.log("app/routes/visualizer.$id.tsx/runGeneration has begun working")
        if(!initialImage) return
        // console.log("app/routes/visualizer.$id.tsx/initialImage",initialImage)

        try { //if we do we ll try to genertae the 3d view
            setIsProcessing(true); //display sort of loading 1:57:33
                //extract the result out of the call
            const result = await generate3DView({ sourceImage: initialImage}) //1:57:50
                          //item.sourceImage }); 

                console.log("app/routes/visualizer.$id.tsx/generate3DView/renderedImage", result)

            if(result.renderedImage) { //if we get back a result we set it to the state 1:58:00
                setCurrentImage(result.renderedImage);

                //once we get this image we ll also hve to update 1:58:05
                   //  the project in the DB with the rendered image
                // const updatedItem = {
                //     ...item,
                //     renderedImage: result.renderedImage,
                //     renderedPath: result.renderedPath,
                //     timestamp: Date.now(),
                //     ownerId: item.ownerId ?? userId ?? null,
                //     isPublic: item.isPublic ?? false,
                // }

                // const saved = await createProject({ item: updatedItem, visibility: "private" })

                // if(saved) {
                //     setProject(saved);
                //     setCurrentImage(saved.renderedImage || result.renderedImage);
                // }
            }
        } catch (error) { //1:58:30
            console.error('Generation failed: ', error)
        } finally {
            setIsProcessing(false); //in all cases whther it succeeded or fails
        }
    }

    // useEffect(() => { 
    //     let isMounted = true;

    //     const loadProject = async () => {
    //         if (!id) {
    //             setIsProjectLoading(false);
    //             return;
    //         }

    //         setIsProjectLoading(true);

    //         const fetchedProject = await getProjectById({ id });

    //         if (!isMounted) return;

    //         setProject(fetchedProject);
    //         setCurrentImage(fetchedProject?.renderedImage || null);
    //         setIsProjectLoading(false);
    //         hasInitialGenerated.current = false;
    //     };

    //     loadProject();

    //     return () => {
    //         isMounted = false;
    //     };
    // }, [id]);

    useEffect(() => {//1:58:50 keep track of the changes
        // console.log("app/routes/visualizer.$id.tsx -- use effect is working")
        console.log("app/routes/visualizer.$id.tsx --initialImage",initialImage)
        console.log("app/routes/visualizer.$id.tsx -- hasInitialGenerated.current=",hasInitialGenerated.current)
        console.log("app/routes/visualizer.$id.tsx -- !project?.sourceImage= ", !project?.sourceImage )
        console.log("app/routes/visualizer.$id.tsx --initialImage",initialImage)

        if(!initialImage || hasInitialGenerated.current) return //1:59:05
        // if ( //1:59:03
        //     //isProjectLoading ||
        //     hasInitialGenerated.current || !project?.sourceImage ) return;
       

         console.log("app/routes/visualizer.$id.tsx -- initialRender", initialRender)
        if(initialRender){ //1:59:15
            setCurrentImage(initialRender)
            hasInitialGenerated.current = true; //update the ref
            return; //1:59:30
        }
        // if (project.renderedImage) { //1:59:15
        //     setCurrentImage(project.renderedImage);``
        //     hasInitialGenerated.current = true; //update the ref
        //     return; //1:59:30
        // }
        

        hasInitialGenerated.current = true; //update the initialRef 1:59:33
        void runGeneration();
    }, [initialImage, initialRender]) //1:58:55
    //[project, isProjectLoading]);

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

            <section //2:02:25 
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
                                {//project?.sourceImage
                                initialImage //2:05:25
                                 && ( //check whether w ehve access to the source initial image
                                    <img 
                                        src={initialImage}//project?.sourceImage} //2:05:34
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
