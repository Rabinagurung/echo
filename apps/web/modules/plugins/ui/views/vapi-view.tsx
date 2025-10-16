"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import PluginCard, { type Feature } from "../components/plugin-card";

import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {  z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {  Button } from "@workspace/ui/components/button";
import { GlobeIcon, PhoneIcon, PhoneCallIcon, WorkflowIcon } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

const vapiFeatures: Feature[] = [
  {
    icon: GlobeIcon,
    label: "Web voice calls",
    description: "Voice chat directly in your app",
  },
  {
    icon: PhoneIcon,
    label: "Phone numbers",
    description: "Get dedicated business lines",
  },
  {
    icon: PhoneCallIcon,
    label: "Outbound calls",
    description: "Automated customer outreach",
  },
  {
    icon: WorkflowIcon,
    label: "Workflows",
    description: "Custom conversation flows",
  },
];

const formSchema = z.object({
    publicApiKey: z.string().min(1, { message: "Public API key is required" }),
    privateApiKey: z.string().min(1, { message: "Private API key is required" }),
});

interface VapiPluginFormProps {
    open: boolean;
    setOpen: (value: boolean) => void;
}


/**
 * Modal form that collects Vapi API credentials and schedules a backend upsert.
 *
 * UX flow:
 * - User enters keys and submits.
 * - Triggers `api.private.secrets.upsert` mutation, which schedules
 *   `internal.system.secrets.upsert` to write the secret to AWS Secrets Manager
 *   and upsert a plugin record in Convex.
 * - On success, closes the dialog and shows a toast.
 */
const VapiPluginForm = ({open, setOpen}: VapiPluginFormProps) => {

    const upsertSecret = useMutation(api.private.secrets.upsert);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            publicApiKey: "",
            privateApiKey: ""
        }
    });


    /**
     * Handles form submission by invoking a Convex mutation that schedules
     * an internal action to persist the secret and link the plugin.
     */
    const onSubmit = async(data: z.infer<typeof formSchema>) =>{
        try {
            await upsertSecret({
                service: "vapi",
                value: {
                    publicApiKey: data.publicApiKey,
                    privateApiKey: data.privateApiKey
                }
            })

            setOpen(false);
            toast.success("Vapi secret created");
            
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");  
        }
    }

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enbale Vapi</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                Your API keys are safely encrypted and stored using AWS Secrets
                Manager.
                </DialogDescription>
                <Form {...form}>
                    <form 
                        className="flex flex-col gap-y-4"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FormField  
                            control={form.control}
                            name='publicApiKey'
                            render={({field}) => (
                                <FormItem>
                                    <Label>Public API key</Label>
                                    <FormControl>
                                        <Input 
                                        {...field}
                                        placeholder="Your public API key"
                                        type="text"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField  
                            control={form.control}
                            name='privateApiKey'
                            render={({field}) => (
                                <FormItem>
                                    <Label>Private API key</Label>
                                    <FormControl>
                                        <Input 
                                        {...field}
                                        placeholder="Your private API key"
                                        type="text"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                disabled={form.formState.isSubmitting}
                                type="submit"   
                            >
                                {form.formState.isSubmitting ? "Connecting..." : "Connect"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )

}


/**
 * ### `VapiView`
 *
 * Main React client component responsible for managing the **Vapi plugin integration**.
 * It handles connection state, plugin loading, and conditional rendering between the
 * connection UI and connected state.
 *
 * ---
 *
 * #### 🧠 Overview
 * - Fetches the current organization’s **Vapi plugin record** via
 *   [`useQuery`](https://docs.convex.dev/react/use-query) → `api.private.plugins.getOne`.
 * - Displays a [`PluginCard`](../components/plugin-card.tsx) prompting connection
 *   when no plugin exists.
 * - Renders a placeholder connected view (`<div>Connected!!</div>`) when a plugin exists
 *   — in the future this will be replaced by `VapiConnectedView`.
 * - Embeds the [`VapiPluginForm`](#) dialog to securely collect and submit Vapi API credentials.
 *
 * ---
 *
 * #### ⚙️ Internal Logic
 * - **`vapiPlugin`** — result of `useQuery(api.private.plugins.getOne, { service: "vapi" })`
 *   - `undefined` → loading state (query not resolved yet)
 *   - `null` → no plugin found (not connected)
 *   - plugin object → connected (has secretName + service + org linkage)
 *
 * - **`toggleConnection()`**
 *   - If `vapiPlugin` exists → opens a future *remove* dialog.
 *   - If not connected → opens the *connect* form (`VapiPluginForm`).
 *
 * - **State:**
 *   - `connectOpen` → controls visibility of the connect dialog form.
 *   - `removeOpen` → placeholder for a future remove confirmation dialog.
 *
 * ---
 *
 * #### 🧩 UI Behavior
 * - While `vapiPlugin` is loading, disables the connect button in `PluginCard`.
 * - When disconnected, displays `PluginCard` showing:
 *   - Service name and image
 *   - Marketing feature bullets (`vapiFeatures`)
 *   - “Connect” button
 * - When connected, displays a temporary “Connected!!” message.
 *
 * ---
 *
 * #### 🔐 Data Flow
 * 1. User clicks **Connect** → opens `VapiPluginForm`.
 * 2. `VapiPluginForm` calls [`api.private.secrets.upsert`](../../backend/convex/private/secrets.ts),
 *    which schedules [`internal.system.secrets.upsert`](../../backend/convex/system/secrets.ts).
 * 3. The internal action:
 *    - Persists credentials in **AWS Secrets Manager** under `tenant/{orgId}/vapi`.
 *    - Creates or updates the plugin record in Convex.
 * 4. When the Convex query re-runs and returns a plugin record, the UI updates
 *    to the connected state.
 */
const VapiView = () => {

    /**
     * Presence of a plugin record indicates that Vapi is connected for this org.
     * `undefined` => loading; `null` => not found; object => connected.
     */   
    const vapiPlugin = useQuery(api.private.plugins.getOne, {service: "vapi"}); 

     // Controls visibility of the connection modal dialog. 
    const [connectOpen, setConnectOpen] = useState(false); 

     // Controls visibility of the future removal confirmation dialog.
    const [removeOpen, setRemoveOpen] = useState(false); 


     /**
     * Handles the "Connect" button inside PluginCard component:
     * - If plugin exists, open the remove dialog (not yet implemented here).
     * - If not connected, open the connect dialog.
     */
    const toggleConnection = () =>{
        if(vapiPlugin) {
            setRemoveOpen(true)
        } else {
            setConnectOpen(true)
        }
    }


  return (
    <>
    <VapiPluginForm open={connectOpen} setOpen={setConnectOpen}/>
    <div className="flex min-h-screen flex-col bg-muted p-8">
        <div className="mx-auto w-full max-w-screen-md">
            <div className="space-y-2">
                <h1 className="text-2xl md:text-4xl">Vapi Plugin</h1>
                <p className="text-muted-foreground">Connect Vapi to enable AI voice calls and phone support</p>
            </div>
            <div className="mt-8">
                {vapiPlugin ? ( 
                    <div>Connected!!</div>
                ) :  (
                    <PluginCard 
                        isDisabled={vapiPlugin === undefined}
                        serviceName="Vapi"
                        serviceImage="/vapi.jpg"
                        features={vapiFeatures}
                        onSubmit={toggleConnection}
                    />
               )}
            </div>
        </div>
    </div>
    </>
  )
}

export default VapiView;