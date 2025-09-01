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
import { Button } from "@workspace/ui/components/button";
import { GlobeIcon, PhoneIcon, PhoneCallIcon, WorkflowIcon } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useState } from "react";


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