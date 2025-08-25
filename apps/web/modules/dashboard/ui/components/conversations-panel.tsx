"use client"

import { useAtomValue, useSetAtom } from 'jotai'
import React from 'react'
import { statusFilterAtom } from '../../atoms'
import { usePathname } from 'next/navigation'
import {useInfiniteScroll} from "@workspace/ui/hooks/useInfiniteScroll";
import  InfiniteScrollTrigger from "@workspace/ui/components/infinite-scroll-trigger";
import { formatDistanceToNow } from "date-fns";
import { api } from "@workspace/backend/_generated/api";
import  DicebearAvatar  from "@workspace/ui/components/dicebear-avatar";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import { usePaginatedQuery } from "convex/react";
import { ListIcon, CornerUpLeftIcon, ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import  ConversationStatusIcon from "@workspace/ui/components/conversation-status-icon";

import { Skeleton } from "@workspace/ui/components/skeleton";
import { getCountryFromTimezone, getCountryFlagUrl } from '@/lib/country-utils'
import { Doc } from '@workspace/backend/_generated/dataModel';

const ConversationsPanel = () => {
    const pathName = usePathname()
    const statusFilter = useAtomValue(statusFilterAtom); 
    const setStatusFilter = useSetAtom(statusFilterAtom); 

    const conversations = usePaginatedQuery(api.private.conversations.getMany, 
        {
            status: statusFilter === "all" ? undefined : statusFilter
        }, 
        {   initialNumItems: 10 }
    )

    console.log(typeof conversations.results[0]?.status);

    const {
        topElementRef,
        isLoadingFirstPage,
        handleLoadMore, 
        canLoadMore, 
        isLoadingMore
    } = useInfiniteScroll({
        status: conversations.status, 
        loadMore: conversations.loadMore,
        loadSize:10
    });

  return (
    <div className='flex h-full w-full flex-col bg-background text-sidebar-foreground'>
        <div className='flex flex-col gap-3.5 border-b p-2 '>
          <Select 
          defaultValue='all' 
          value={statusFilter} 
          onValueChange={(value) => setStatusFilter(value as Doc<"conversations">["status"] | "all")}
          >
            <SelectTrigger >
               <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>
                <div className='flex items-center gap-2'>
                  <ListIcon className='size-4'/>
                    <span>All</span>
                </div>
              </SelectItem>
              <SelectItem value='unresolved'>
                <div className='flex items-center gap-2'>
                  <ArrowRightIcon className='size-4'/>
                    <span>Unresolved</span>
                </div>
              </SelectItem>
               <SelectItem value='resolved'>
                <div className='flex items-center gap-2'>
                  <CheckIcon className='size-4'/>
                    <span>Resolved</span>
                </div>
              </SelectItem>
              <SelectItem value='escalated'>
                <div className='flex items-center gap-2'>
                  <ArrowUpIcon className='size-4'/>
                    <span>Escalated</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isLoadingFirstPage ? <SkeletonConversations/> : 
        <ScrollArea className='max-h-[calc(100vh-53px)]'>
            <div className='flex w-full flex-1 flex-col text-sm'>
              {conversations.results.map((conversation)=> {
                const isLastMessageOperator = conversation.lastMessage?.message?.role !== "user"; 
                
                const country = conversation.contactSession.metadata?.timezone ? 
                getCountryFromTimezone(conversation.contactSession.metadata?.timezone) 
                :undefined;

                const countryFlagUrl = country?.code ?  getCountryFlagUrl(country.code) : undefined;
                return (
                  <Link 
                    key={conversation._id} 
                    href={`/conversations/${conversation._id}`}
                    className={cn("relative flex cursor-pointer items-start gap-3 border-b p-4 py-5 text-sm leading-tight hover:bg-accent hover:text-accent-foreground", 
                      pathName === `/conversations/${conversation._id}` && "bg-accent text-accent-foreground"
                    )}>

                      <div className={cn(`-translate-y-1/2  absolute top-1/2 left-0 h-[64%] w-1 rounded-r-full bg-neutral-300 opacity-0 transition-opacity`, 
                         pathName === `/conversations/${conversation._id}` && "opacity-100"
                      )}/>

                      <DicebearAvatar 
                      seed={conversation.contactSession?._id}
                      badgeImageUrl={countryFlagUrl}
                      size={40}
                      />

                      <div className='flex-1'>
                        <div className='flex w-full items-center gap-2'>
                          <span className='truncatte font-bold'>{conversation.contactSession.name}</span>
                          <span className='ml-auto shrink-0 text-muted-foreground text-xs'>{formatDistanceToNow(conversation._creationTime)}</span>
                        </div>
                        <div className='mt-1 flex items-center justify-between gap-2'>
                          <div className='flex w-0 grow items-center gap-1'>
                            {isLastMessageOperator && 
                            (<CornerUpLeftIcon className='size-3 shrink-0 text-muted-foreground'/>)}
                            <span className={cn("line-clamp-1 text-muted-foreground textxs", 
                              !isLastMessageOperator && "font-bold text-black")}>
                                {conversation.lastMessage?.text ?? "No messages yet"}
                                </span>
                          </div>
                          <ConversationStatusIcon status={conversation.status}/>
                        </div>
                      </div>
                  </Link>
                )
              })}
              <InfiniteScrollTrigger 
                canLoadMore={canLoadMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={handleLoadMore}
                ref={topElementRef}
              />
            </div>
        </ScrollArea>
        }
    </div>
  )
}

export default ConversationsPanel; 


export const SkeletonConversations = () => {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
      <div className="relative flex w-full min-w-0 flex-col p-2">
        <div className="w-full space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              className="flex items-start gap-3 rounded-lg p-4"
              key={index}
            >
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <div className="flex w-full items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="ml-auto h-3 w-12 shrink-0" />
                </div>
                <div className="mt-2">
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}