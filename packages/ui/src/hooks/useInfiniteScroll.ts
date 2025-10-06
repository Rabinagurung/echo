import { useEffect, useCallback, useRef } from "react";

interface UseInfiniteScrollProps{
    status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
    loadMore: (numItems: number) => void;
    loadSize: number;
    observerEnabled?:boolean
}

export const useInfiniteScroll = ({status, loadMore, loadSize=10, observerEnabled=true}:UseInfiniteScrollProps) =>{
    console.log("2");
    console.log({status})

    const topElementRef = useRef<HTMLDivElement>(null);

    const current = topElementRef.current;
    console.log({current});
    console.log("2 end ");

    
    const handleLoadMore = useCallback(()=>{
        console.log("Status updated: ", status);
        if(status === "CanLoadMore") 
            return loadMore(loadSize)
        
    }, [status, loadMore,loadSize ])
   
    useEffect(() => {
        console.log("use effect start");
        const topElement = topElementRef.current; 

        console.log({topElement});

        if(!(topElement && observerEnabled )) return;
        

        const observer = new IntersectionObserver(
            ([entry]) => {
                if(entry?.isIntersecting) {
                    handleLoadMore()
                }
            }, 
            {threshold: 0.1}
        );
        
        observer.observe(topElement);

        console.log("use effect finished")

        return () => {
            observer.disconnect();
        }

    },[handleLoadMore, observerEnabled])

    return {
        topElementRef, 
        handleLoadMore, 
        canLoadMore: status === "CanLoadMore", 
        isLoadingMore: status === "LoadingMore", 
        isLoadingFirstPage: status === "LoadingFirstPage", 
        isExhausted: status === "Exhausted"
    }
}