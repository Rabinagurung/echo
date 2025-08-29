"use client"; 

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@workspace/ui/components/dropzone";
import { api } from "@workspace/backend/_generated/api";
import { useAction } from "convex/react";
import { useState } from "react";
import { Label } from "@workspace/ui/components/label";


interface UploadDialogProps{
   open: boolean; 
   onOpenChange: (open: boolean) => void;
   onFileUploaded?: () => void;
}

export const UploadDialog = ({
    open, 
    onOpenChange,
    onFileUploaded,
}:UploadDialogProps) =>  {

    const addFile = useAction(api.private.files.addFile);

    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        category: "",
        filename: ""
    });
    
    
    const handleFileDrop = (acceptedFiles: File[]) => {
        // 
        console.log({acceptedFiles});
        const file = acceptedFiles[0];

        
        if(file) {
            setUploadedFiles([file]);
            //  
            console.log({uploadForm});
            if(!uploadForm.filename) {
                setUploadForm((prev) => ({ ...prev, filename: file.name }))
            }
        }
    }


    const handleUpload = async() =>{
        setIsUploading(true);
        try {
            console.log({uploadedFiles})
            const blob = uploadedFiles[0];
            if(!blob) return;

             // 
            console.log({blob});
            const filename = uploadForm.filename || blob.name;

            await addFile({
                bytes: await blob.arrayBuffer(),
                filename,
                category: uploadForm.category,
                mimeType: blob.type || "text/plain"
            })

            onFileUploaded?.();
            handleCancel();
        } catch (error) {
            console.error(error)
            
        }finally{
            setIsUploading(false)
        }

    }

    const handleCancel = () => {
        onOpenChange(false);
        setUploadedFiles([]);
        setUploadForm({
            category: "",
            filename: ""
        });
    };

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                    Upload documents to your knowledge base for AI-powered search and
                    retrieval
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">
                            Category
                        </Label>
                        <Input 
                            id="category"
                            value={uploadForm.category}
                            type="text"
                            placeholder="e.g., Documentation, Support, Product"
                            onChange={(e) => setUploadForm((prev) => ({
                                ...prev, 
                                category: e.target.value
                            }))}
                             className="w-full"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="filename">
                            Filename
                        </Label>
                        <Input 
                            id="filename"
                            value={uploadForm.filename}
                            type="text"
                            placeholder="Override default filename"
                            onChange={(e) => setUploadForm((prev) => ({
                                ...prev, 
                                filename: e.target.value
                            }))}
                            className="w-full"
                        />
                    </div>

                    <Dropzone 
                        disabled={isUploading}
                        maxFiles={1}
                        onDrop={handleFileDrop}
                        src={uploadedFiles}
                        accept={{
                            "application/pdf": [".pdf"],
                            "text/csv":[".csv"],
                            "text/plain":[".txt"]
                        }}
                    >
                        <DropzoneEmptyState/>
                        <DropzoneContent/>
                    </Dropzone>
                </div>

                <DialogFooter>
                    <Button
                        disabled={isUploading}
                        onClick={handleCancel}
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={uploadedFiles.length === 0 || isUploading || !uploadForm.category}
                    >
                        {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

