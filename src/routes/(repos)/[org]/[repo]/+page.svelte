<script lang="ts">
  import { run } from 'svelte/legacy';

  import type { PageData } from "./$types";
  import { page } from "$app/stores";
  import { marked } from "marked";
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let cloneProtocol: "https" | "ssh" = $state("https");

  let sshPort = $derived($page.url.hostname === "localhost" ? 2222 : 22);
  // If user is accessing via 127.0.0.2 (testing), assume port 22
  run(() => {
    if ($page.url.hostname === "127.0.0.2") sshPort = 22;
  });

  let sshHost = $derived($page.url.hostname);

  let cloneUrl =
    $derived(cloneProtocol === "https"
      ? `${$page.url.origin}/${data.namespace.slug}/${data.repo.name}.git`
      : sshPort === 22
        ? `git@${sshHost}:${data.namespace.slug}/${data.repo.name}.git`
        : `ssh://git@${sshHost}:${sshPort}/${data.namespace.slug}/${data.repo.name}.git`);

  let readmeHtml = $derived(data.readme ? marked.parse(data.readme) : "");
</script>

<div class="repo-header">
  <div class="header-top">
    <h1 class="repo-title">
      <a href="/{data.namespace.slug}">{data.namespace.slug}</a>
      <span class="divider">/</span>
      <span class="name">{data.repo.name}</span>
      <span class="badge">{data.repo.isPrivate ? "Private" : "Public"}</span>
    </h1>
  </div>
  <div class="header-actions">
    <div class="clone-controls">
      <div class="btn-group">
        <button
          class="btn-sm {cloneProtocol === 'https' ? 'active' : ''}"
          onclick={() => (cloneProtocol = "https")}>HTTPS</button
        >
        <button
          class="btn-sm {cloneProtocol === 'ssh' ? 'active' : ''}"
          onclick={() => (cloneProtocol = "ssh")}>SSH</button
        >
      </div>
      <div class="clone-box">
        <input
          type="text"
          readonly
          value={cloneUrl}
          onclick={(e) => e.currentTarget.select()}
        />
        <button
          class="btn-icon"
          onclick={() => navigator.clipboard.writeText(cloneUrl)}
          title="Copy to clipboard"
        >
          📋
        </button>
      </div>
    </div>
  </div>
</div>

<main class="repo-content">
  <div class="file-browser">
    <div class="browser-header">
      <span>Files</span>
      <span>master</span>
    </div>
    <div class="file-list">
      {#each data.files as file}
        <div class="file-row">
          <span class="file-icon">📄</span>
          <span class="file-name">{file.file}</span>
          <span class="file-msg">Update {file.file}</span>
          <span class="file-time">2h ago</span>
        </div>
      {:else}
        <div class="empty-state">
          <p>This repository is empty.</p>
          <p>Push code to get started:</p>
          <pre>git remote add origin {cloneUrl}</pre>
        </div>
      {/each}
    </div>
  </div>

  {#if data.readme}
    <div class="readme-preview">
      <h3>README.md</h3>
      <div class="markdown-body">
        {@html readmeHtml}
      </div>
    </div>
  {/if}
</main>

<style>
  .repo-header {
    background: var(--muted);
    padding: 2rem 0;
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--border);
  }

  .repo-title {
    font-size: 1.5rem;
    font-weight: 400;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .repo-title a {
    text-decoration: none;
    color: var(--foreground);
  }
  .repo-title a:hover {
    text-decoration: underline;
  }
  .repo-title .divider {
    color: var(--muted-foreground);
  }
  .repo-title .name {
    font-weight: 600;
  }

  .header-actions {
    margin-top: 1rem;
  }

  .clone-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-group {
    display: flex;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .btn-group .btn-sm {
    border: none;
    background: var(--card);
    border-right: 1px solid var(--border);
    border-radius: 0;
    padding: 0.25rem 0.75rem;
    cursor: pointer;
    font-size: 0.8rem;
    color: var(--muted-foreground);
  }

  .btn-group .btn-sm:last-child {
    border-right: none;
  }

  .btn-group .btn-sm.active {
    background: var(--muted);
    color: var(--foreground);
    font-weight: 500;
  }

  .clone-box {
    display: inline-flex;
    align-items: center;
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.25rem 0.5rem;
  }

  .btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    margin-left: 0.5rem;
    padding: 0;
    opacity: 0.7;
  }
  .btn-icon:hover {
    opacity: 1;
  }

  .clone-box input {
    border: none;
    font-family: monospace;
    width: 300px;
    outline: none;
  }

  .file-browser {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    margin-bottom: 2rem;
  }
  .browser-header {
    background: var(--muted);
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    font-weight: 500;
    border-bottom: 1px solid var(--border);
  }
  .file-row {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border);
    display: grid;
    grid-template-columns: auto 1fr 2fr auto;
    gap: 1rem;
    align-items: center;
  }
  .file-row:last-child {
    border-bottom: none;
  }
  .file-name {
    font-weight: 500;
  }
  .file-msg {
    color: var(--muted-foreground);
    font-size: 0.9rem;
  }
  .file-time {
    color: var(--muted-foreground);
    font-size: 0.875rem;
  }

  .readme-preview {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 2rem;
  }
</style>
