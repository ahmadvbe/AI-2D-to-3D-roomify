import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import {ArrowRight, ArrowUpRight, Clock, Layers} from "lucide-react";
import Button from "../../components/ui/Button";
import Upload from "../../components/Upload";
import {useNavigate} from "react-router";
import {useEffect, useRef, useState} from "react";

//and we will call this function createProject in our app/routes/home.tsx
import {createProject, getProjects} from "../../lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() { 
    const navigate = useNavigate();

    //test of the create Project func created at lib/puter.action.ts 1:33:00
    const [projects, setProjects] = useState<DesignItem[]>([]);
    // const isCreatingProjectRef = useRef(false);

    const handleUploadComplete = async (base64Image: string) => {
        // try {

        //     if(isCreatingProjectRef.current) return false;
        //     isCreatingProjectRef.current = true;
             const newId = Date.now().toString();
             const name = `Residence ${newId}`; //1:33:40

            const newItem = { //1:34:00
                id: newId, name, sourceImage: base64Image,
                renderedImage: undefined,
                timestamp: Date.now()
            }

            //1:34:25 call the craete project func
            const saved = await createProject({ 
                    item: newItem, 
                    visibility: 'private' });

            if(!saved) {//1:34:40 if it doesnt exist
                console.error("Failed to create project");
                return false;
            }
                    //if success 1:35:00
            setProjects((prev) => [saved, ...prev]); //prepend the new item instead of appending it
            //so it comes on top 

            navigate(`/visualizer/${newId}`),
             { //1:35:20 provide some additonal state
                state: { //pass our initial image 
                    initialImage: saved.sourceImage, //before
                    initialRendered: saved.renderedImage || null, //after
                    name
                }
            };

            return true;
        // } finally {
        //     isCreatingProjectRef.current = false;
        // }
    }

    useEffect(() => {
        const fetchProjects = async () => {
            // const items = await getProjects();

            // setProjects(items)
        }

        fetchProjects();
    }, []);

  return (
      <div //12:55
        className="home">
          <Navbar />

          <section  //36:40
            className="hero">
              <div className="announce">
                  <div className="dot">
                      <div className="pulse"></div>
                  </div>

                  <p>Introducing Roomify 2.0</p>
              </div>

              <h1>Build beautiful spaces at the speed of thought with Roomify</h1>

              <p className="subtitle">
                  Roomify is an AI-first design environment that helps you visualize, render, and ship architectural projects faster  than ever.
              </p>

              <div className="actions">
                  <a href="#upload"  //38:38
                        className="cta">
                      Start Building <ArrowRight className="icon" />
                  </a>

                  <Button  //39:04
                    variant="outline" size="lg" className="demo">
                      Watch Demo
                  </Button>
              </div>

              <div //39:25
                id="upload" 
                className="upload-shell">
                <div //39:58
                    className="grid-overlay" />

                  <div className="upload-card">
                      <div className="upload-head">
                          <div className="upload-icon">
                              <Layers //40:25 lucide react
                                className="icon" />
                          </div>

                          <h3>Upload your floor plan</h3>
                          <p>Supports JPG, PNG, formats up to 10MB</p>
                      </div>

                      <Upload 
                        onComplete={handleUploadComplete} />
                  </div>
              </div>
          </section>

          <section  //41:10 Display the projects being uploaded
            className="projects">
              <div className="section-inner">
                  <div className="section-head">
                      <div className="copy">
                          <h2>Projects</h2>
                          <p>Your latest work and shared community projects, all in one place.</p>
                      </div>
                  </div>

                  <div //42:10
                    className="projects-grid">
                            {/* //1:36:00 */}
                      {projects.map(({id, name, renderedImage, sourceImage, timestamp}) => (
                        //automatic return this project card group 
                        // - return multiple cards nt only one
                          <div      key={id} 
                                    className="project-card group" 
                                    onClick={() => navigate(`/visualizer/${id}`)}>
                              <div      className="preview">
                                  <img  
                                    src={renderedImage || sourceImage} alt="Project"
                                  />

                                  <div  //43:10
                                    className="badge">
                                      <span>Community</span>
                                  </div>
                              </div>

                              <div  //43:26
                                className="card-body">
                                  <div //render the real name 1:37:10
                                    >
                                      <h3>{name}</h3>

                                      <div className="meta">
                                          <Clock size={12} />
                                          <span>{new Date(timestamp).toLocaleDateString()}</span>
                                          <span>By WEBE </span>
                                      </div>
                                  </div>
                                  <div //44:25 
                                    className="arrow">
                                      <ArrowUpRight size={18} />
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </section>
      </div>
  )
}
