"use client"; 

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@workspace/ui/components/dropzone";
import { api } from "@workspace/backend/_generated/api";
import { useAction } from "convex/react";
import { useState } from "react";
import { Label } from "@workspace/ui/components/label";


interface UploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFileUploaded?: () => void;
}

export const UploadDialog = ({open, onOpenChange, onFileUploaded}:UploadDialogProps) => {

    const addFile = useAction(api.private.files.addFile); 

    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    console.log({uploadedFiles})
    const [isUploading, setIsUploading] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        category: "",
        filename: ""
    });


    const handleFileDrop = (acceptedFiles: File[]) =>{
        console.log({acceptedFiles});

        const file = acceptedFiles[0]; 

        console.log({file})

        if(file) {
            setUploadedFiles([file]);
            console.log({uploadedFiles})
            if(!uploadForm.filename) {
                setUploadForm((prev) => ({...prev, filename: file.name}))
            }

            console.log({uploadForm})
        }
    }


    const handleUpload = async () =>{

        setIsUploading(true);

        try {
            console.log({uploadedFiles});
            const blob = uploadedFiles[0]
            console.log({blob}); 

            if(!blob) return;

            const filename = uploadForm.filename || blob.name; 

            await addFile({
                bytes: await blob.arrayBuffer(), 
                filename, 
                mimeType: blob.type || "text/plain", 
                category: uploadForm.category
            });
        
            onFileUploaded?.();
            handleCancel();
            
        } catch (error) {
            console.error(error);
            
        } finally {
            setIsUploading(false);
        }

    }

    const handleCancel = () => {
        onOpenChange(false); 
        setUploadedFiles([]);
        setUploadForm({ category: "", filename: ""})
    }


    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        Upload Document
                    </DialogTitle>
                    <DialogDescription>
                        Upload documents to your knowledge base for AI-powered search and retrieval
                    </DialogDescription>
                </DialogHeader>
               <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input 
                            className="w-full" 
                            id="category"
                            onChange={(e) => setUploadForm((prev) => ({
                                ...prev, 
                                category: e.target.value
                            }))}
                            value={uploadForm.category}
                            type="text"
                            placeholder="e.g., Documentation, Support, Product"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="filename">
                            Filename{ " "}
                            <span className="text-muted-foreground text-xs">(optional)</span>
                        </Label>
                        <Input
                            className="w-full"
                            id="filename"
                            type="text"
                            placeholder="Override default filename"
                            onChange={(e) => setUploadForm((prev) =>({
                                ...prev,
                                filename: e.target.value
                            }))}
                            value={uploadForm.filename}
                        />
                    </div>
                    <Dropzone 
                        accept={{
                        "application/pdf": [".pdf"], 
                        "text/csv": [".csv"], 
                        "text/plain": [".txt"], 
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
                        }}
                        disabled={isUploading}
                        maxFiles={1}
                        onDrop={handleFileDrop}
                        src={uploadedFiles}
                    >
                        <DropzoneEmptyState/>
                        <DropzoneContent/>
                    </Dropzone>
                </div>
                <DialogFooter>
                    <Button 
                        variant="outline"
                        disabled={isUploading}
                        onClick={handleCancel}
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



