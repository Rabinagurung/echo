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


 /**
  * Initial screen that authenticates/identifies a contact for the widget.
  *
  * Responsibilities:
  * 1. Validate name/email client-side.
  * 2. Collect lightweight environment metadata (UA, timezone, screen, etc.).
  * 3. Create a `contactSession` via Convex in Convex database
  * 4. Persist the returned `contactSessionId` (scoped by organization) in local storage and advance UI.
  *
  * @component
  * @returns React element for the widget auth screen.
  *
  * @remarks
  * - Uses Jotai for state (organization-scoped contactSessionId, screen routing).
  * - Uses Convex `public.contactSessions.create` mutation.
  * - Disables submit while `isSubmitting` to prevent duplicate requests.
  *
  */
const WidgetAuthScreen = () => {
  const organizationId = useAtomValue(organizationIdAtom);
  console.log("Auth screen", {organizationId});

  const setContactSessionId = useSetAtom(contactSessionIdAtomFamily(organizationId || ""))
  const setScreen = useSetAtom(screenAtom)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "", 
      email: ""
    } 
  })

  /**
   * Convex mutation to create a contact session.
   * @see /convex/public/contactSessions.create
   */
  const createContactSession = useMutation(api.public.contactSessions.create);


  /**
   * Handles form submission:
   * 1) Builds browser/environment metadata.
   * 2) Creates the contact session in DB.
   * 3) Stores session id in local (scoped) atom + switches to "selection" screen.
   *
   * @param data - Validated form values {name, email}.
   * @remarks
   * - No-op if `organizationId` is missing (widget not fully configured).
   * - Assumes mutation success; add try/catch for UX resilience.
   */
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

    // 1) Create the contact session (server)
    const contactSessionId = await createContactSession({...data, organizationId, metadata})

    // 2) Persist id + navigate to next screen (client)
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
                <Input placeholder="eg:johndoe@gmail.com" className='h-10 bg-background' type='email' {...field}  />
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