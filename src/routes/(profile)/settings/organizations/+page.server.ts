import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { mainDb } from '$lib/server/db';
import { namespaces } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// Reserved namespaces
const RESERVED = ['api', 'settings', 'auth', 'explore', 'new', 'admin'];

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.session) throw redirect(302, '/auth/signin');

    const orgs = await mainDb.query.namespaces.findMany({
        where: (n, { eq, and }) => and(eq(n.ownerId, locals.user!.id), eq(n.type, 'org')),
        orderBy: (n, { desc }) => [desc(n.createdAt)]
    });

    return {
        orgs
    };
};

import { z } from 'zod';

export const actions: Actions = {
    create: async ({ request, locals }) => {
        if (!locals.session) return fail(401);
        
        const createOrgSchema = z.object({
            slug: z.string().trim().toLowerCase()
                .min(1, "Organization name required")
                .regex(/^[a-zA-Z0-9-]+$/, "Invalid characters. Alphanumeric and dashes only.")
                .refine(s => !RESERVED.includes(s), "Name reserved")
        });

        const formData = await request.formData();
        const rawData = Object.fromEntries(formData);
        
        const result = createOrgSchema.safeParse(rawData);
        
        if (!result.success) {
            return fail(400, { error: result.error.issues[0].message });
        }

        const { slug } = result.data;

        const conflict = await mainDb.query.namespaces.findFirst({
            where: (n, { eq }) => eq(n.slug, slug)
        });
        if (conflict) return fail(400, { error: 'Organization name taken' });

        const visibility = (formData.get('visibility') as string) || 'private';
        const isPrivate = visibility === 'private';

        await mainDb.insert(namespaces).values({
            id: crypto.randomUUID(),
            slug,
            type: 'org',
            ownerId: locals.user!.id,
            isPrivate,
            createdAt: new Date()
        });
        
        return { success: true };
    }
};
