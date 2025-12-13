<script lang="ts">
  import type { PageData } from "./$types";
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<h1>Explore</h1>
<p class="subtitle">Discover users and organizations on GitPremo.</p>

<div class="namespace-grid">
  {#each data.namespaces as ns}
    <a href="/{ns.slug}" class="namespace-card">
      <div class="card-header">
        <strong>{ns.slug}</strong>
        <span class="badge">{ns.type}</span>
      </div>
    </a>
  {:else}
    <p>No users or organizations found.</p>
  {/each}
</div>

<style>
  .subtitle {
    color: var(--muted-foreground);
    margin-bottom: 2rem;
  }

  .namespace-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .namespace-card {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.5rem;
    text-decoration: none;
    color: var(--foreground);
    transition: border-color 0.2s;
  }

  .namespace-card:hover {
    border-color: var(--primary);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .badge {
    background: var(--muted);
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.8rem;
  }
</style>
