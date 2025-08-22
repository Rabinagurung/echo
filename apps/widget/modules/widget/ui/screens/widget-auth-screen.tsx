"use client"

import React from 'react'
import WidgetHeader from '../components/widget-header'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@workspace/ui/components/form'

import {z} from "zod"; 
import {useForm} from "react-hook-form"; 
import {zodResolver} from "@hookform/resolvers/zod";
import { Button } from '@workspace/ui/components/button';

import { Input } from '@workspace/ui/components/input';
import { useMutation } from 'convex/react';
import { api } from '@workspace/backend/_generated/api';
import { Doc } from '@workspace/backend/_generated/dataModel';
import { useAtomValue, useSetAtom } from 'jotai';
import { contactSessionIdAtomFamily, organizationIdAtom, screenAtom } from '../../atoms/widget-atoms';



 const FormSchema = z.object({
    name: z.string().min(1 , "Name is required"), 
    email: z.string().email("Invalid email address")
 })

const WidgetAuthScreen = () => {
  const organizationId = useAtomValue(organizationIdAtom);
  const setContactSessionId = useSetAtom(contactSessionIdAtomFamily(organizationId || ""))
  const setScreen = useSetAtom(screenAtom)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "", 
      email: ""
    } 
  })

  const createContactSession = useMutation(api.public.contactSessions.create);

  const onSubmit = async(data:z.infer<typeof FormSchema>) =>{

    if(!organizationId) return ;

    const metadata: Doc<"contactSessions">["metadata"] = {
      userAgent: navigator.userAgent, 
      language: navigator.language,
      languages: navigator.languages?.join(","), 
      platform: navigator.platform, 
      vendor: navigator.vendor,
      screenResolution: `${screen.width}x${screen.height}`, 
      viewportSize: `${window.innerWidth}*${window.innerHeight}`, 
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, 
      timezoneOffset: new Date().getTimezoneOffset(),
      cookieEnabled: navigator.cookieEnabled,
      referrer: document.referrer || "direct",
      currentUrl: window.location.href
    }

    const contactSessionId = await createContactSession({...data, organizationId, metadata})


    setContactSessionId(contactSessionId);
    setScreen("selection")
    
  }

  return (
    <>
     <WidgetHeader className='flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold'>
            <p className='text-3xl'>Hi there! 👋</p>
            <p className='text-lg'>Let's get you started</p>
    </WidgetHeader>

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-y-4 p-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="e.g. John Doe" className='h-10 bg-background' type='text' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="eg:johndoe@gmail.com" className='h-10 bg-background' type='text' {...field}  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>Submit</Button>
      </form>
    </Form>
       
    </>
  )
}

export default WidgetAuthScreen