import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { mainDb } from "./db";
import { user, session, account, verification } from "./db/schema"; 

export const auth = betterAuth({
    database: drizzleAdapter(mainDb, {
        provider: "sqlite",
        schema: {
            user,
            session,
            account,
            verification
        }
    }),
    emailAndPassword: {
        enabled: true
    },
    // Add other providers (GitHub etc) here if needed
});
