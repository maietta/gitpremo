import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve('data');
const ORGS_DIR = path.resolve(DATA_DIR, 'orgs');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(ORGS_DIR)) fs.mkdirSync(ORGS_DIR);

// Central DB Connection
const mainDbPath = path.join(DATA_DIR, 'main.db');
const mainSqlite = new Database(mainDbPath);
// Initialize Main DB Schema
const mainSchemaPath = path.resolve('src/lib/server/db/schemas/main.sql');
if (fs.existsSync(mainSchemaPath)) {
    mainSqlite.exec(fs.readFileSync(mainSchemaPath, 'utf8'));
}

export const mainDb = drizzle(mainSqlite, { schema });

// Cache for org connections to avoid reopening files constantly
const orgDbCache = new Map<string, ReturnType<typeof drizzle<typeof schema>>>();

export class DbManager {
    static getNamespaceDb(namespaceParam: string) {
        // Find the namespace ID or File based on slug? 
        // For simplicity, we name the file `{slug}.db` directly. 
        // Verification that slug exists in `mainDb` should happen in business logic/middleware, 
        // but physically we just map slug -> file.
        
        if (orgDbCache.has(namespaceParam)) {
            return orgDbCache.get(namespaceParam)!;
        }

        const dbPath = path.join(ORGS_DIR, `${namespaceParam}.db`);
        const isNew = !fs.existsSync(dbPath);
        
        const sqlite = new Database(dbPath);
        const db = drizzle(sqlite, { schema });

        if (isNew) {
            // Run init script
            const orgSchemaPath = path.resolve('src/lib/server/db/schemas/org.sql');
            if (fs.existsSync(orgSchemaPath)) {
                sqlite.exec(fs.readFileSync(orgSchemaPath, 'utf8'));
            }
        }

        orgDbCache.set(namespaceParam, db);
        return db;
    }

    static getRootConfig() {
        // specialized helper if we need direct access
        return mainDb.query.systemConfig.findMany();
    }
}
