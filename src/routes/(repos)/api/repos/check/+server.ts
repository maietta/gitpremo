import { json } from '@sveltejs/kit';
import { DbManager, mainDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const namespace = url.searchParams.get('namespace');
    const name = url.searchParams.get('name');

    if (!namespace || !name) {
        return json({ available: false, error: 'Missing parameters' }, { status: 400 });
    }

    // First check if namespace exists
    const ns = await mainDb.query.namespaces.findFirst({
        where: (n, { eq }) => eq(n.slug, namespace)
    });

    if (!ns) {
        return json({ available: false, error: 'Namespace not found' }, { status: 404 });
    }

    try {
        const db = DbManager.getNamespaceDb(namespace);
        const repo = await db.query.repositories.findFirst({
            where: (r, { eq }) => eq(r.name, name)
        });

        return json({ available: !repo });
    } catch (e) {
        console.error('Error checking repo availability:', e);
        return json({ available: false, error: 'Internal server error' }, { status: 500 });
    }
};
