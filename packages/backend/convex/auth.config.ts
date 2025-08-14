;

const domain = process.env.CLERK_JWT_ISSUER_DOMAIN;
if (!domain) {
 throw new Error(
   "Missing CLERK_JWT_ISSUER_DOMAIN. Set it to your Clerk JWT issuer domain (e.g. https://<tenant>.clerk.accounts.dev)."
);
}

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ]
} 