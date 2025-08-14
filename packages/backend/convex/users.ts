import { mutation, query } from "./_generated/server";

export const getMany = query({
    args: {},
    handler: async(ctx) =>{
        const users = await ctx.db.query("users").collect()

        return users;
    }
})

export const add = mutation({
    args: {}, 
    handler: async(ctx) =>{

    const identity = await ctx.auth.getUserIdentity(); 

    // if(!identity) throw new Error("Not Authenticated")

        const orgId = identity?.orgId as string;

      if(!identity) throw new Error("Missing Organization")
      

     return await ctx.db.insert("users", {
            name: "Rachana"
            })

        
    }
})

