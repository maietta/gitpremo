import type { PageServerLoad } from './$types';
import { DbManager, mainDb } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
    const { org } = params;
    
    // verify namespace exists in main db
    const ns = await mainDb.query.namespaces.findFirst({
        where: (n, { eq }) => eq(n.slug, org)
    });
    
    if (!ns) {
        throw error(404, 'Namespace not found');
    }
    
    // Load tenant DB
    const db = DbManager.getNamespaceDb(org);
    
    const isOwner = locals.user?.id === ns.ownerId;

    const repos = await db.query.repositories.findMany({
        where: (r, { eq, and }) => isOwner ? undefined : eq(r.isPrivate, false),
        orderBy: (r, { desc }) => [desc(r.createdAt)]
    });

    return {
        namespace: ns,
        repos,
        isOwner
    };
};
