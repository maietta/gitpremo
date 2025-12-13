-- Organization/User Tenant Database Schema
-- Stored in data/orgs/{namespace}.db

CREATE TABLE IF NOT EXISTS repositories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, -- URL slug within the namespace
    description TEXT,
    isPrivate INTEGER DEFAULT 0,
    defaultBranch TEXT DEFAULT 'main',
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_repositories_name ON repositories(name);

CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY,
    repositoryId TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    number INTEGER NOT NULL, -- Scoped to repository
    title TEXT NOT NULL,
    body TEXT,
    status TEXT DEFAULT 'open', -- open, closed
    creatorId TEXT NOT NULL, -- Refers to user.id in main.db
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_issues_repo_number ON issues(repositoryId, number);

CREATE TABLE IF NOT EXISTS pull_requests (
    id TEXT PRIMARY KEY,
    repositoryId TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    status TEXT DEFAULT 'open', -- open, closed, merged
    sourceBranch TEXT NOT NULL,
    targetBranch TEXT NOT NULL,
    creatorId TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_prs_repo_number ON pull_requests(repositoryId, number);

CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    issueId TEXT REFERENCES issues(id) ON DELETE CASCADE,
    prId TEXT REFERENCES pull_requests(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    authorId TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    CHECK (issueId IS NOT NULL OR prId IS NOT NULL)
);
