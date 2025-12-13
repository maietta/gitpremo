import { handleGitRequest } from '$lib/server/git/handler';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
    const { org, repo } = event.params;
    return handleGitRequest(event, org, { name: repo });
};

export const POST: RequestHandler = async (event) => {
    const { org, repo } = event.params;
    return handleGitRequest(event, org, { name: repo });
};
