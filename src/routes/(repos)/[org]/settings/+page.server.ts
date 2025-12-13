import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { mainDb } from '$lib/server/db';
import { namespaces } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
    // Check session
    if (!locals.session) throw redirect(302, '/auth/signin');

    const { org } = params;
    
    // Fetch namespace
    const ns = await mainDb.query.namespaces.findFirst({
        where: (n, { eq }) => eq(n.slug, org)
    });
    
    if (!ns) throw redirect(404, '/'); // Or 404 page

    // Check ownership
    // Use locals.user!.id (safe because we checked session above)
    if (ns.ownerId !== locals.user!.id) {
        throw redirect(403, `/${org}`);
    }

    return {
        namespace: ns
    };
};

export const actions: Actions = {
    update: async ({ request, params, locals }) => {
        if (!locals.session) return fail(401);

        const { org } = params;
        const formData = await request.formData();
        
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const website = formData.get('website') as string;
        const publicEmail = formData.get('publicEmail') as string;
        const location = formData.get('location') as string;
        const isPrivate = formData.get('isPrivate') === 'on';
        const avatarFile = formData.get('avatar') as File | null;

        // Validation could go here (zod)

        // Verify ownership again
        const ns = await mainDb.query.namespaces.findFirst({
            where: (n, { eq }) => eq(n.slug, org)
        });

        if (!ns || ns.ownerId !== locals.user!.id) {
             return fail(403, { error: 'Unauthorized' });
        }
        
        let avatarData = ns.avatar; // Keep existing if not provided
        
        if (avatarFile && avatarFile.size > 0) {
            // Check file type (image/png, image/jpeg, etc.)
            if (!avatarFile.type.startsWith('image/')) {
                 return fail(400, { error: 'Invalid file type' });
            }
            if (avatarFile.size > 2 * 1024 * 1024) { // 2MB limit
                 return fail(400, { error: 'Image too large (max 2MB)' });
            }

            const buffer = await avatarFile.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            avatarData = `data:${avatarFile.type};base64,${base64}`;
        }

        try {
            await mainDb.update(namespaces)
                .set({
                    name,
                    description,
                    website,
                    location,
                    publicEmail,
                    isPrivate,
                    avatar: avatarData
                })
                .where(eq(namespaces.slug, org));

            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { error: 'Failed to update settings' });
        }
    }
};
