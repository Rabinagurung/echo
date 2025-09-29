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
import { z } from "zod";
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

const VapiPluginForm = ({open, setOpen}: VapiPluginFormProps) => {

    const upsertSecret = useMutation(api.private.secrets.upsert);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            publicApiKey: "",
            privateApiKey: ""

        }
    })

    const onSubmit = async(values: z.infer<typeof formSchema>) =>{
        try {
            await upsertSecret({
                service: "vapi",
                value: {
                    publicApiKey: values.publicApiKey,
                    privateApiKey: values.privateApiKey
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
                            name='publicApiKey'
                            render={({field}) => (
                                <FormItem>
                                    <Label>Public API key</Label>
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

const VapiRemmovePluginForm = ({open, setOpen}: VapiPluginFormProps) => {

    const removePlugin = useMutation(api.private.plugins.remove);

    const onSubmit = async() =>{
        try {
            await removePlugin({
                service: "vapi"
            })
            setOpen(false);
            toast.success("Vapi plugin removed");
            
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
                Are you sure you want to disconnect the Vapi plugin?
                </DialogDescription>
                 <DialogFooter>
                    <Button onClick={onSubmit} variant="destructive">
                        Disconnect
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}

const VapiView = () => {

    const vapiPlugin = useQuery(api.private.plugins.getOne, {service: "vapi"}); 

    const [connectOpen, setConnectOpen] = useState(false); 
    const [removeOpen, setRemoveOpen] = useState(false); 

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
               <PluginCard 
                    serviceName="Vapi"
                    serviceImage="/vapi.jpg"
                    features={vapiFeatures}
                    onSubmit={toggleConnection}
               />
            </div>
        </div>
    </div>
    </>
  )
}

export default VapiView;