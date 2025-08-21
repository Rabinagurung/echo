import { google } from "@ai-sdk/google";
import { components } from "../../../_generated/api"
import { Agent } from "@convex-dev/agent";


export const supportAgent = new Agent(components.agent, {
  chat: google.chat("gemini-1.5-flash"),
  instructions: "You are a customer supporter agent"
});