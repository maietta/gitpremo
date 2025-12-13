import type { PageServerLoad } from './$types';
import { DbManager, mainDb } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import path from 'node:path';
import { GitService } from '$lib/server/git';

const REPOS_ROOT = path.resolve('data/orgs');

export const load: PageServerLoad = async ({ params, url }) => {
    const { org, repo } = params;
    
    // Verify Namespace
    const ns = await mainDb.query.namespaces.findFirst({
        where: (n, { eq }) => eq(n.slug, org)
    });
    if (!ns) throw error(404, 'Namespace not found');

    // Verify Repo in DB
    const db = DbManager.getNamespaceDb(org);
    const repoMeta = await db.query.repositories.findFirst({
        where: (r, { eq }) => eq(r.name, repo)
    });
    // Note: If checking root routing, we might skip DB check? But this route is [org]/[repo], so strict check is good.
    if (!repoMeta) {
         // Auto-check fs for dev sync? No, stick to DB authoritative.
         throw error(404, 'Repository not found');
    }

    const fullRepoPath = path.join(REPOS_ROOT, org, 'repos', `${repo}.git`);
    const files = await GitService.getFileTree(fullRepoPath, 'HEAD');
    
    // Check for README
    const readmeFile = files.find(f => f.file.toLowerCase().startsWith('readme'));
    let readmeContent = null;
    if (readmeFile) {
        readmeContent = await GitService.getFileContent(fullRepoPath, 'HEAD', readmeFile.file);
    }

    return {
        namespace: ns,
        repo: repoMeta,
        files,
        readme: readmeContent
    };
};
