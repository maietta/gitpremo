import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { DbManager, mainDb } from '$lib/server/db';
import { GitService } from '$lib/server/git';
import { repositories } from '$lib/server/db/schema';
import path from 'node:path';

const REPOS_ROOT = path.resolve('data/orgs');

export const load: PageServerLoad = async ({ locals }) => {
    // Auth Guard
    if (!locals.session) {
        throw redirect(302, '/auth/signin');
    }
    
    const ownedNamespaces = await mainDb.query.namespaces.findMany({
        where: (ns, { eq }) => eq(ns.ownerId, locals.user!.id)
    });
    
    return {
        namespaces: ownedNamespaces
    };
};

import { z } from 'zod';

const createRepoSchema = z.object({
    namespace: z.string().min(1),
    name: z.string().regex(/^[a-zA-Z0-9-]+$/, "Invalid name. Alphanumeric and dashes only."),
    description: z.string().optional(),
    private: z.literal("on").optional().transform(v => !!v)
});

export const actions: Actions = {
    create: async ({ request, locals }) => {
        try {
            if (!locals.session) return fail(401);
            
            const formData = await request.formData();
            const rawData = Object.fromEntries(formData);
            
            const result = createRepoSchema.safeParse(rawData);
            
            if (!result.success) {
                const error = result.error.issues[0].message;
                return fail(400, { error });
            }

            const { namespace, name, description, private: isPrivate } = result.data;
            
            const db = DbManager.getNamespaceDb(namespace);
            
            // Check collision
            const existing = await db.query.repositories.findFirst({
                where: (r, { eq }) => eq(r.name, name)
            });
            
            if (existing) {
                return fail(400, { error: 'Repository already exists' });
            }
            
            // Create DB Record
            const repoId = crypto.randomUUID();
            await db.insert(repositories).values({
                id: repoId,
                name,
                description,
                isPrivate,
                createdAt: new Date(),
                updatedAt: new Date(),
                defaultBranch: 'master' 
            });
            
            // Init Git Repo
            const fullRepoPath = path.join(REPOS_ROOT, namespace, 'repos', `${name}.git`);
            GitService.ensureRepo(fullRepoPath);
            
            throw redirect(302, `/${namespace}/${name}`);

        } catch (e) {
            // Rethrow redirect
            if ((e as any)?.status === 302) throw e;

            console.error('Repo Creation Error:', e);
            return fail(500, { error: 'Internal Server Error: ' + (e as Error).message });
        }
    }
};
