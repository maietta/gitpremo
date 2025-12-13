import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import type { InferSelectModel } from 'drizzle-orm';

// --- Main Database Schema ---

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull(),
	image: text('image'),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
});

export type User = InferSelectModel<typeof user>;

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ipAddress'),
	userAgent: text('userAgent'),
	userId: text('userId')
		.notNull()
		.references(() => user.id)
});

export type Session = InferSelectModel<typeof session>;

export const account = sqliteTable('account', {
	id: text('id').primaryKey(),
	accountId: text('accountId').notNull(),
	providerId: text('providerId').notNull(),
	userId: text('userId')
		.notNull()
		.references(() => user.id),
	accessToken: text('accessToken'),
	refreshToken: text('refreshToken'),
	idToken: text('idToken'),
	accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp' }),
	scope: text('scope'),
	password: text('password'),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
});

export const namespaces = sqliteTable('namespaces', {
	id: text('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	type: text('type').notNull(), // 'user' | 'org'
	ownerId: text('ownerId').references(() => user.id),
    name: text('name'),
    description: text('description'),
    website: text('website'),
    location: text('location'),
    avatar: text('avatar'), // Stored as data URI or similar
    publicEmail: text('publicEmail'),
    isPrivate: integer('isPrivate', { mode: 'boolean' }).default(false),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull()
});

export const systemConfig = sqliteTable('system_config', {
	key: text('key').primaryKey(),
	value: text('value').notNull()
});

export const sshKeys = sqliteTable('ssh_keys', {
	id: text('id').primaryKey(),
	userId: text('userId')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	publicKey: text('publicKey').notNull(),
	name: text('name'),
	fingerprint: text('fingerprint'),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull()
});

// --- Organization/User Tenant Schema ---

export const repositories = sqliteTable('repositories', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	isPrivate: integer('isPrivate', { mode: 'boolean' }).default(false),
	defaultBranch: text('defaultBranch').default('main'),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
}, (table) => ({
    nameIdx: uniqueIndex('idx_repositories_name').on(table.name)
}));

export const issues = sqliteTable('issues', {
	id: text('id').primaryKey(),
	repositoryId: text('repositoryId')
		.notNull()
		.references(() => repositories.id, { onDelete: 'cascade' }),
	number: integer('number').notNull(),
	title: text('title').notNull(),
	body: text('body'),
	status: text('status').default('open'), // 'open', 'closed'
	creatorId: text('creatorId').notNull(), // User ID
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
}, (table) => ({
    issueIdx: uniqueIndex('idx_issues_repo_number').on(table.repositoryId, table.number)
}));

export const pullRequests = sqliteTable('pull_requests', {
	id: text('id').primaryKey(),
	repositoryId: text('repositoryId')
		.notNull()
		.references(() => repositories.id, { onDelete: 'cascade' }),
	number: integer('number').notNull(),
	title: text('title').notNull(),
	body: text('body'),
	status: text('status').default('open'), // 'open', 'closed', 'merged'
	sourceBranch: text('sourceBranch').notNull(),
	targetBranch: text('targetBranch').notNull(),
	creatorId: text('creatorId').notNull(),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
}, (table) => ({
    prIdx: uniqueIndex('idx_prs_repo_number').on(table.repositoryId, table.number)
}));

// ... existing tables ...

import { relations } from 'drizzle-orm';

export const userRelations = relations(user, ({ many }) => ({
	sshKeys: many(sshKeys),
    namespaces: many(namespaces)
}));

export const sshKeysRelations = relations(sshKeys, ({ one }) => ({
	user: one(user, {
		fields: [sshKeys.userId],
		references: [user.id],
	}),
}));

export const namespacesRelations = relations(namespaces, ({ one }) => ({
	owner: one(user, {
        fields: [namespaces.ownerId],
        references: [user.id]
    })
}));

export const comments = sqliteTable('comments', {
	id: text('id').primaryKey(),
	issueId: text('issueId').references(() => issues.id, { onDelete: 'cascade' }),
	prId: text('prId').references(() => pullRequests.id, { onDelete: 'cascade' }),
	body: text('body').notNull(),
	authorId: text('authorId').notNull(),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
});

