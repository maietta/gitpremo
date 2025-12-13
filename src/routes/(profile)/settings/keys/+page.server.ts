import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { mainDb } from '$lib/server/db';
import { sshKeys } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.session) throw redirect(302, '/auth/signin');

    const keys = await mainDb.query.sshKeys.findMany({
        where: (k, { eq }) => eq(k.userId, locals.user!.id),
        orderBy: (k, { desc }) => [desc(k.createdAt)]
    });

    return {
        keys
    };
};

export const actions: Actions = {
    add: async ({ request, locals }) => {
        if (!locals.session) return fail(401);

        const data = await request.formData();
        const publicKey = data.get('key')?.toString().trim();
        const name = data.get('name')?.toString() || 'My Key';

        if (!publicKey) {
            return fail(400, { error: 'Invalid key' });
        }

        // Basic validation/fingerprint extraction could be done here (simplified for MVP)
        // Store simple key
        
        await mainDb.insert(sshKeys).values({
            id: crypto.randomUUID(),
            userId: locals.user!.id,
            publicKey,
            name,
            createdAt: new Date()
        });
        
        return { success: true };
    },
    
    delete: async ({ request, locals }) => {
        if (!locals.session) return fail(401);
        const data = await request.formData();
        const id = data.get('id')?.toString();
        
        if (!id) return fail(400);

        // Security: Ensure key belongs to user
        const key = await mainDb.query.sshKeys.findFirst({
             where: (k, { eq, and }) => and(eq(k.id, id), eq(k.userId, locals.user!.id))
        });
        
        if (!key) return fail(403);

        await mainDb.delete(sshKeys).where(eq(sshKeys.id, id));
        return { success: true };
    }
};
