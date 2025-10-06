
import React from 'react'
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

interface InfiniteScrollTriggerProps {
    canLoadMore: boolean;
    isLoadingMore: boolean;
    onLoadMore: () => void;
    loadMoreText?: string;
    noMoreText?: string; 
    className?:string;
    ref?: React.Ref<HTMLDivElement>

}
const InfiniteScrollTrigger = ({
    canLoadMore,
    isLoadingMore, 
    onLoadMore,
    loadMoreText = "Load more", 
    noMoreText = "No more items", 
    className,
    ref
}:InfiniteScrollTriggerProps) => {

    console.log("Infinite Scroll Trigger component called")
    
    console.log({ref});
    let text = loadMoreText; 

    if(isLoadingMore) {
        text = "Loading..."
    } else if(!canLoadMore) {
        text = noMoreText
    }

  return (
    <div className={cn("flex w-full justify-center py-2", className)} ref={ref}>
        <Button 
            disabled={!canLoadMore || isLoadingMore}
            onClick={onLoadMore}
            size="sm"
            variant="ghost"
        >
            {text}
        </Button>
    </div>
  )
}

export default InfiniteScrollTrigger