"use client";


import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@workspace/ui/components/dropdown-menu";
import InfiniteScrollTrigger from "@workspace/ui/components/infinite-scroll-trigger";
import { 
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableCell,
  TableCaption,
  TableRow
} from "@workspace/ui/components/table"; 
import { useInfiniteScroll } from "@workspace/ui/hooks/useInfiniteScroll";
import { usePaginatedQuery } from "convex/react";
import {  FileIcon, MoreHorizontalIcon, PlusIcon, TrashIcon } from "lucide-react";
import { UploadDialog } from "../components/upload-dialog";
import { useState } from "react";
import { DeleteFileDialog } from "../components/delete-file-dialog";
import type { PublicFile } from "@workspace/backend/private/files";

const FilesView = () => {

  const files = usePaginatedQuery(api.private.files.list, {}, {initialNumItems: 10});
  console.log("In Files View");
  console.log({files});
  console.log("View end");
  console.log("1");
  const {
    topElementRef, 
    handleLoadMore, 
    canLoadMore, 
    isLoadingFirstPage, 
    isLoadingMore
  } = useInfiniteScroll({
    status: files.status, 
    loadMore: files.loadMore, 
    loadSize: 10
  });

  console.log("3");
  console.log({topElementRef, handleLoadMore, canLoadMore, isLoadingFirstPage, isLoadingMore});

  console.log("4");
  console.log("Top element current value: ", topElementRef.current);
  console.log("4 end");

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PublicFile | null>(null);

  const handleDeleteClick = (file: PublicFile) => {
    setSelectedFile(file); 
    setDeleteDialogOpen(true);
  }

  const handleFileDeleted = () => {
    setSelectedFile(null);
  }
 

  return (
    <>
      <DeleteFileDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} file={selectedFile} onDeleted={handleFileDeleted}/>
      <UploadDialog onOpenChange={setUploadDialogOpen} open={uploadDialogOpen}/>
      <div className="flex min-h-screen flex-col p-8 bg-muted">
      <div className="mx-auto w-full max-w-screen-md">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl">Knowledge Base</h1>
          <p>Upload and manage documents for your AI assistant</p>
        </div>
        <div className="mt-8 rounded-lg border bg-background">
          <div className="flex items-center justify-end px-6 py-4 border-b ">
            <Button
              onClick={() => setUploadDialogOpen(true)}
            >
              <PlusIcon/>
              Add New 
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6 py-4 font-medium">Name</TableHead>
                <TableHead className="px-6 py-4 font-medium">Type</TableHead>
                <TableHead className="px-6 py-4 font-medium">Size</TableHead>
                <TableHead className="px-6 py-4 font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(()=> {
                if(isLoadingFirstPage) {
                  return(
                    <TableRow>
                      <TableCell className="h-24 text-center" colSpan={4}>
                        Loading files...
                      </TableCell>
                    </TableRow>
                  );
                }

                if(files.results.length === 0) {
                  return (
                    <TableRow>
                      <TableCell className="h-24 text-center" colSpan={4}>
                        No files found
                      </TableCell>
                    </TableRow>
                  )
                }

                return files.results.map((file) => (
                  <TableRow className="hover:bg-muted/50" key={file.id}>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileIcon/>
                        {file.name}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className="uppercase" variant="outline">
                        {file.type}
                      </Badge>
                    </TableCell>
                     <TableCell className="px-6 py-4 text-muted-foreground">
                        {file.size}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              className="size-8 p-0" 
                              size="sm" 
                              variant="ghost"
                            >
                              <MoreHorizontalIcon/>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(file)}>
                              <TrashIcon className="size-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              })()}
            </TableBody>
          </Table>

          {!isLoadingFirstPage && files.results.length > 0 && (
            <div className="border-t">
              <InfiniteScrollTrigger 
                canLoadMore={canLoadMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={handleLoadMore}
                ref={topElementRef}
              />
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default FilesView;


