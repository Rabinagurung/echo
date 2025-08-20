export const WIDGET_SCREENS = [
    "error",
     "loading", 
     "auth", 
     "selection", 
     "voice", 
     "inbox", 
     "chat", 
     "contact"
    ] as const;

//key in local storage to store user contact session Id.
export const CONTACT_SESSION_KEY = "echo_contact_session"