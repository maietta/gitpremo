import { GitService } from './index';
import path from 'node:path';
import type { RequestEvent } from '@sveltejs/kit';

const REPOS_ROOT = path.resolve('data/orgs');

export const handleGitRequest = async (event: RequestEvent, namespace: string, repoHelpers: { name: string }) => {
    const { url, params, request } = event;
    const git_path = params.git_path;
    const service = url.searchParams.get('service');
    const repo = repoHelpers.name;

    // TODO: Verify Namespace exists in DB? 
    // For now we assume FS structure mirrors valid state or we do checks.
    
    // Verify path safety
    if (namespace.includes('..') || repo.includes('..')) {
        return new Response('Invalid path', { status: 400 });
    }
    
    // Construction: data/orgs/{namespace}/repos/{repo}.git
    const fullRepoPath = path.join(REPOS_ROOT, namespace, 'repos', `${repo}.git`);
    
    // Auto-init for dev
    GitService.ensureRepo(fullRepoPath);

    if (request.method === 'GET' && git_path === 'info/refs') {
        if (!service) return new Response('Service required', { status: 400 });
        return GitService.handleInfoRefs(fullRepoPath, service);
    }

    if (request.method === 'POST') {
        // Basic Auth Stub
        const authHeader = request.headers.get('Authorization');
        if (!authHeader && git_path === 'git-receive-pack') {
             return new Response('Unauthorized', {
                status: 401,
                headers: { 'WWW-Authenticate': 'Basic realm="GitPremo"' }
            });
        }
        
        if (git_path === 'git-upload-pack') {
            return GitService.handleService(fullRepoPath, 'git-upload-pack', request.body!);
        }
        
        if (git_path === 'git-receive-pack') {
            return GitService.handleService(fullRepoPath, 'git-receive-pack', request.body!);
        }
    }
    
    return new Response('Not found', { status: 404 });
};
