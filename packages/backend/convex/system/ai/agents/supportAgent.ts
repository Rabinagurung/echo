import { google } from "@ai-sdk/google";
import { components } from "../../../_generated/api"
import { Agent } from "@convex-dev/agent";
import { SUPPORT_AGENT_PROMPT } from "../constants";


export const supportAgent = new Agent(components.agent, {
  chat: google.chat("gemini-2.0-flash"),
  instructions: SUPPORT_AGENT_PROMPT
});