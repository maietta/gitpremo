import { handleGitRequest } from '$lib/server/git/handler';
import type { RequestHandler } from './$types';
import { DbManager } from '$lib/server/db';

const ROOT_ORG_SLUG = 'nick'; // TODO: Load from DbManager.getRootConfig() or env

export const GET: RequestHandler = async (event) => {
    const { repo } = event.params;
    // Route: [repo].git so 'repo' param is just the name (e.g. 'project')
    // We treat this as being in the ROOT_ORG_SLUG namespace.
    return handleGitRequest(event, ROOT_ORG_SLUG, { name: repo });
};

export const POST: RequestHandler = async (event) => {
    const { repo } = event.params;
    return handleGitRequest(event, ROOT_ORG_SLUG, { name: repo });
};
