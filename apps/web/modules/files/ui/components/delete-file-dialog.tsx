"use client"; 

import { api } from '@workspace/backend/_generated/api';
import type { PublicFile } from '@workspace/backend/private/files';
import { Button } from '@workspace/ui/components/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { useMutation } from 'convex/react';
import { open } from 'fs';
import { useState } from 'react';


interface DeleteFileDialogProps {
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    file: PublicFile | null;
    onDeleted?: () => void;
}

export const DeleteFileDialog = ({
    open, 
    onOpenChange, 
    file, 
    onDeleted
}: DeleteFileDialogProps) =>{

    const deleteFile = useMutation(api.private.files.deleteFile); 
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async() =>{

        if(!file) {
            return;
        }

        setIsDeleting(true);

        try {
            await deleteFile({entryId: file.id}); 
            onDeleted?.();
            onOpenChange(false);
        } catch (error) {
            console.error(error)
        } finally{
            setIsDeleting(false);
        }

    }


    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Delete File
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this file? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                {file && (
                    <div className='py-4'>
                        <div className='rounded-lg border bg-muted/50 p-4'>
                            <p>{file.name}</p>
                            <p className='text-muted-foreground text-sm'>
                                Type: {file.type.toUpperCase()} | Size: {file.size}
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button 
                        variant="outline"
                        disabled={isDeleting}
                        onClick={() => onOpenChange(false)}

                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="destructive" 
                        disabled={isDeleting || !file}
                        onClick={handleDelete}
                    >
                       {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
