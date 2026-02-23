import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useOutletContext} from "react-router";
import {CheckCircle2, ImageIcon, UploadIcon} from "lucide-react";
import {PROGRESS_INCREMENT, REDIRECT_DELAY_MS, PROGRESS_INTERVAL_MS} from "../lib/constants";

// components/Upload.tsx 46:29

interface UploadProps { //57:50 
    onComplete?: (base64Data: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
     const [file, setFile] = useState<File | null>(null); //47:15 check whether there is an uploaded file
     const [isDragging, setIsDragging] = useState(false); //47:45 whether we re dragging a file
     const [progress, setProgress] = useState(0); //47:52 keepm track of the upload loader
    const intervalRef = useRef<NodeJS.Timeout | null>(null); 
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

     const { isSignedIn } = useOutletContext<AuthContext>();//48:00 check whether the user is logged in

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, []);

    const processFile = useCallback((file: File) => { //57:58 MAKE SURE IT IS CACHED WITH THE USE OF USECALLBACK
        if (!isSignedIn) return;
            //ELSE IF WE RE LOGGED IN
        setFile(file); //UPLOAD THE FILW THE USER WANTS TO UPOAD
        setProgress(0); //RESET THE PROGRESS TO 0

        const reader = new FileReader();
        reader.onerror = () => { //1:07:20 error discovered by github
            setFile(null);
            setProgress(0);
        };
        reader.onloadend = () => {
            const base64Data = reader.result as string;

            intervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    const next = prev + PROGRESS_INCREMENT; 
                    //WE SET THE INTERVAL TO CONTINUOUSLY UPDATE THE PROGRESS OF THE UPLOAD 58:20
                    if (next >= 100) {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                        timeoutRef.current = setTimeout(() => {
                            onComplete?.(base64Data);
                            timeoutRef.current = null;
                        }, REDIRECT_DELAY_MS);
                        return 100;
                    }
                    return next;
                });
            }, PROGRESS_INTERVAL_MS);
        };
        reader.readAsDataURL(file); //THEN WE READ THE FILE 58:22
    }, [isSignedIn, onComplete]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!isSignedIn) return;
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => { //58:30
        e.preventDefault();
        setIsDragging(false);

        if (!isSignedIn) return;

        const droppedFile = e.dataTransfer.files[0];
        const allowedTypes = ['image/jpeg', 'image/png']; //1:07:50 coderabbit fixes -- allowed types
        if (droppedFile && allowedTypes.includes(droppedFile.type)) {
            processFile(droppedFile);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return;

        const selectedFile = e.target.files?.[0];
        if (selectedFile) { //OR WHEN WE MANUALLY SELECT AN IMAGE 58:35
            processFile(selectedFile);
        }
    };

    return ( //47:05
        <div className="upload">
            {!file ? ( //48:20 if there is no file
                <div
                    className={`dropzone ${isDragging ? 'is-dragging' : ''}`} //49:05
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input //49:25


                        type="file"
                        className="drop-input"
                        accept=".jpg,.jpeg,.png,.webp"
                        disabled={!isSignedIn} //if we re nt signed in 
                        onChange={handleChange}
                    />

                    <div //50:00
                        className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {isSignedIn ? ( //50:20
                                "Click to upload or just drag and drop"
                            ): ("Sign in or sign up with Puter to upload")}
                        </p>
                        <p className="help">Maximum file size 50 MB.</p>
                    </div>
                </div>
            ) : ( //51:13 if we hve already uploaded a file
                <div className="upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            {progress === 100 ? (//51:45 check mark showing the completion 
                                <CheckCircle2 className="check" />
                            ): (
                                <ImageIcon className="image" />
                            )}
                        </div>

                        <h3>{file.name}</h3>

                        <div //52:35
                            className='progress'>
                            <div className="bar" style={{ width: `${progress}%` }} />

                            <p className="status-text">
                                {progress < 100 ? 'Analyzing Floor Plan...' : 'Redirecting...'}
                            </p>
                        </div>
                        
                    </div>
                </div>
            )}
        </div>

        //53:45 now we hve to keep track of a lot of diff constants and we dnt wanat to store any info within this component
        //instead lib/constants.ts
    )
}
export default Upload
