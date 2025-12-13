import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

export class GitService {
    static async handleInfoRefs(repoPath: string, service: string) {
        if (!['git-upload-pack', 'git-receive-pack'].includes(service)) {
            return new Response('Invalid service', { status: 400 });
        }

        const cmd = service === 'git-upload-pack' ? 'upload-pack' : 'receive-pack';
        
        // Protocol requires the first line to be the service name
        // formatting: "LLLL# service=service_name\n0000"
        // LLLL is hex length of the line including length bytes.
        // "# service=git-upload-pack\n" is 24 bytes + 4 length bytes = 28 bytes = 0x001c
        // Actually, git-upload-pack does not output this by itself with --advertise-refs?
        // Wait, standard `git upload-pack --advertise-refs` DOES NOT output the header. 
        // We must append it manually for HTTP Smart Protocol.
        
        const serviceName = service;
        const pkgLine = `# service=${serviceName}\n`;
        const len = (pkgLine.length + 4).toString(16).padStart(4, '0');
        const header = `${len}${pkgLine}0000`;

        const child = spawn('git', [cmd, '--stateless-rpc', '--advertise-refs', repoPath]);

        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode(header));
                
                child.stdout.on('data', (data) => controller.enqueue(data));
                child.stdout.on('end', () => controller.close());
                
                // Handle stderr?
                child.stderr.on('data', (data) => console.error(`[Git] ${data}`));
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': `application/x-${service}-advertisement`,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
    }

    static async handleService(repoPath: string, service: string, body: ReadableStream) {
        if (!['git-upload-pack', 'git-receive-pack'].includes(service)) {
            return new Response('Invalid service', { status: 400 });
        }

        const cmd = service === 'git-upload-pack' ? 'upload-pack' : 'receive-pack';

        const child = spawn('git', [cmd, '--stateless-rpc', repoPath], {
            stdio: ['pipe', 'pipe', 'pipe'] // Pipe stdin, stdout, stderr
        });

        // Pipe request body to git stdin
        // SvelteKit request.body is a ReadableStream (Web API)
        // Node child.stdin is a Writable (Node API). We need to bridge them.
        const reader = body.getReader();
        const push = async () => {
            const { done, value } = await reader.read();
            if (done) {
                child.stdin.end();
                return;
            }
            child.stdin.write(value);
            push();
        };
        push().catch(err => {
            console.error('Error writing to git stdin', err);
            child.stdin.end();
        });

        const stream = new ReadableStream({
            start(controller) {
                child.stdout.on('data', (data) => controller.enqueue(data));
                child.stdout.on('end', () => controller.close());
                child.stderr.on('data', (data) => console.error(`[Git] ${data}`));
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': `application/x-${service}-result`,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
    }

    static async getFileTree(repoPath: string, ref: string = 'HEAD', directory: string = '.') {
        if (!fs.existsSync(repoPath)) return []; // Return empty if repo doesn't exist

         return new Promise<Array<{ mode: string, type: string, object: string, file: string }>>((resolve, reject) => {
            const child = spawn('git', ['ls-tree', ref, directory], { cwd: repoPath });
            let output = '';
            
            child.stdout.on('data', d => output += d);
            child.stderr.on('data', d => {
                const msg = d.toString();
                if (!msg.includes('Not a valid object name HEAD') && !msg.includes('not a git repository')) {
                    console.error(`[Git ls-tree] ${msg}`);
                }
            });
            
            child.on('close', (code) => {
                if (code !== 0) return resolve([]); // Return empty if ref not found (empty repo)
                
                const files = output.trim().split('\n').filter(Boolean).map(line => {
                    // Format: 100644 blob <hash>    README.md
                    // We need to parse this properly. Tab separated? usually tab before filename.
                    const [meta, file] = line.split('\t');
                    const [mode, type, object] = meta.split(' ');
                    return { mode, type, object, file };
                });
                resolve(files);
            });
         });
    }
    
    static async getFileContent(repoPath: string, ref: string, filePath: string) {
        return new Promise<string>((resolve, reject) => {
             // git show ref:path
             const child = spawn('git', ['show', `${ref}:${filePath}`], { cwd: repoPath });
             let output = '';
             child.stdout.on('data', d => output += d);
             child.on('close', (code) => {
                 if (code !== 0) return resolve('');
                 resolve(output);
             });
        });
    }

    static ensureRepo(repoPath: string) {
        if (!fs.existsSync(repoPath)) {
            try {
                fs.mkdirSync(repoPath, { recursive: true });
                const result = spawnSync('git', ['init', '--bare', repoPath]);
                
                if (result.error) throw result.error;
                if (result.status !== 0) {
                    throw new Error(`Git init failed: ${result.stderr.toString()}`);
                }
            } catch (err) {
                console.error('Failed to create repo:', err);
                throw err;
            }
        }
    }
}
