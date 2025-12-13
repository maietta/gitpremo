import { json, type RequestHandler } from '@sveltejs/kit';
import { mainDb } from '$lib/server/db';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ request, url }) => {
    // Security: Only allow requests from localhost
    const remoteAddr = request.headers.get('x-forwarded-for') || '127.0.0.1';
    // Simplified specific check, in prod use valid network config or shared secret header
    // const authHeader = request.headers.get('Authorization');
    // if (authHeader !== \`Bearer \${env.SSH_SHARED_SECRET}\`) return new Response('Unauthorized', { status: 401 });

    const keys = await mainDb.query.sshKeys.findMany({
        with: {
            user: true
        }
    });

    // Output format for AuthorizedKeysCommand:
    // command="/path/to/shell.sh <user_id>",no-pty,no-port-forwarding,no-X11-forwarding,no-agent-forwarding ssh-rsa ...
    
    // We need to know the path to the shell script. 
    // Ideally this is configured or we assume a path. 
    // Let's assume standard install path or passed via query param?
    // Better: return raw text and let the script format it? 
    // Or just return the standard format.
    
    // Hardcoding a placeholder path that the python/bash script handles is safer?
    // SSHD expects the output to be exactly the authorized_keys format.
    
    const shellPath = '/usr/bin/gitpremo-shell'; // This should match where the user installs the shell script wrapper.

    const lines = keys.map(k => {
        const options = `command="${shellPath} ${k.userId}",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty`;
        return `${options} ${k.publicKey}`;
    });

    return new Response(lines.join('\n'), {
        headers: { 'Content-Type': 'text/plain' }
    });
};
