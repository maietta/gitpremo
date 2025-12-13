import type { PageServerLoad } from './$types';
import { mainDb } from '$lib/server/db';

export const load: PageServerLoad = async () => {
    // Fetch all namespaces (users/orgs)
    const allNamespaces = await mainDb.query.namespaces.findMany({
        where: (ns, { eq, or, isNull }) => or(eq(ns.isPrivate, false), isNull(ns.isPrivate)),
        orderBy: (ns, { desc }) => [desc(ns.createdAt)]
    });
    
    return {
        namespaces: allNamespaces
    };
};
