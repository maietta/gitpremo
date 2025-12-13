import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { mainDb } from '$lib/server/db';
import { namespaces } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Reserved usernames
const RESERVED = ['api', 'settings', 'auth', 'explore', 'new', 'admin'];

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.session) throw redirect(302, '/auth/signin');

    // Check if user has a personal namespace
    /*
      The logic here is:
      1. Find namespace where ownerId = user.id AND type = 'user'
    */
    const ns = await mainDb.query.namespaces.findFirst({
        where: (n, { eq, and }) => and(eq(n.ownerId, locals.user!.id), eq(n.type, 'user'))
    });

    return {
        profileNamespace: ns
    };
};

export const actions: Actions = {
    save: async ({ request, locals }) => {
        if (!locals.session) return fail(401);
        
        const data = await request.formData();
        const username = data.get('username')?.toString().toLowerCase().trim();
        
        if (!username) return fail(400, { error: 'Username required' });
        
        if (RESERVED.includes(username)) {
             return fail(400, { error: 'Username is reserved' });
        }
        
        if (!/^[a-z0-9-_]+$/.test(username)) {
            return fail(400, { error: 'Invalid characters. Use letters, numbers, hyphens.' });
        }

        // Check if user already has a namespace
        const existing = await mainDb.query.namespaces.findFirst({
            where: (n, { eq, and }) => and(eq(n.ownerId, locals.user!.id), eq(n.type, 'user'))
        });

        if (existing) {
            // Update? Renaming usernames is complex (repo paths change).
            // For MVP, allow ONLY if slug hasn't changed, or deny rename.
            if (existing.slug === username) return { success: true };
            return fail(400, { error: 'Renaming username not supported yet.' });
        }
        
        // Check uniqueness
        const conflict = await mainDb.query.namespaces.findFirst({
            where: (n, { eq }) => eq(n.slug, username)
        });
        if (conflict) {
            return fail(400, { error: 'Username taken' });
        }

        // Create
        await mainDb.insert(namespaces).values({
            id: crypto.randomUUID(),
            slug: username,
            type: 'user',
            ownerId: locals.user!.id,
            createdAt: new Date()
        });
        
        return { success: true };
    }
};
