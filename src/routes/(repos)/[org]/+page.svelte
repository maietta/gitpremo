<script lang="ts">
  import type { PageData } from "./$types";
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<div class="profile-header">
  <div class="header-top">
    <h1>{data.namespace.slug}</h1>
    {#if data.isOwner}
      <a href="/{data.namespace.slug}/settings" class="btn btn-outline btn-sm"
        >Settings</a
      >
    {/if}
  </div>
  {#if data.namespace.description}
    <p class="description">{data.namespace.description}</p>
  {/if}
  {#if data.namespace.website || data.namespace.publicEmail || data.namespace.location}
    <div class="meta-row">
      {#if data.namespace.location}
        <span class="meta-item">📍 {data.namespace.location}</span>
      {/if}
      {#if data.namespace.website}
        <a
          href={data.namespace.website}
          target="_blank"
          rel="noopener noreferrer"
          class="meta-item">🔗 {data.namespace.website}</a
        >
      {/if}
      {#if data.namespace.publicEmail}
        <a href="mailto:{data.namespace.publicEmail}" class="meta-item"
          >✉️ {data.namespace.publicEmail}</a
        >
      {/if}
    </div>
  {/if}
</div>

<h2>Repositories</h2>
<div class="repo-list">
  {#each data.repos as repo}
    <div class="repo-item">
      <div class="repo-main">
        <a href="/{data.namespace.slug}/{repo.name}" class="repo-name"
          >{repo.name}</a
        >
        <span class="visibility">{repo.isPrivate ? "Private" : "Public"}</span>
      </div>
      {#if repo.description}
        <p class="repo-desc">{repo.description}</p>
      {/if}
      <div class="repo-meta">
        <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  {:else}
    <p>No repositories found.</p>
  {/each}
</div>

<style>
  .profile-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .description {
    color: var(--muted-foreground);
    margin: 0;
    max-width: 600px;
  }

  .meta-row {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
    font-size: 0.875rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--muted-foreground);
    text-decoration: none;
  }

  .meta-item[href]:hover {
    text-decoration: underline;
    color: var(--foreground);
  }

  .btn-sm {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }

  .repo-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .repo-item {
    padding: 1rem 0;
    border-bottom: 1px solid var(--border);
  }

  .repo-main {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .repo-name {
    font-weight: 600;
    font-size: 1.25rem;
    text-decoration: none;
    color: var(--primary);
  }

  .visibility {
    font-size: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 1rem;
    padding: 0.125rem 0.5rem;
    color: var(--muted-foreground);
  }

  .repo-desc {
    color: var(--muted-foreground);
    margin: 0 0 0.5rem 0;
  }

  .repo-meta {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }
</style>
