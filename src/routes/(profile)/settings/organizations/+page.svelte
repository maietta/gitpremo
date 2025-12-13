<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  interface Props {
    data: PageData;
    form: ActionData;
  }

  let { data, form }: Props = $props();
</script>

<div class="container container-sm">
  <h1>Organizations</h1>
  <p class="subtitle">Manage shared namespaces for teams.</p>

  <div class="orgs-list">
    {#each data.orgs as org}
      <div class="org-item">
        <strong>{org.slug}</strong>
        <a href="/{org.slug}" class="btn btn-ghost btn-sm">View</a>
      </div>
    {:else}
      <p>You haven't created any organizations.</p>
    {/each}
  </div>

  <hr />

  <h3>New Organization</h3>
  <form method="POST" action="?/create" class="create-form">
    {#if form?.error}
      <div class="alert-error">{form.error}</div>
    {/if}

    <div class="form-group">
      <label for="slug">Organization Name</label>
      <input
        type="text"
        name="slug"
        id="slug"
        placeholder="acme-corp"
        required
        pattern="^[a-zA-Z0-9-]+$"
        title="Alphanumeric characters and dashes only"
      />
      <p class="help-text">
        This will be the URL: <code>gitpremo.com/acme-corp</code>
      </p>
    </div>

    <div class="form-group radio-group">
      <label class="radio-label">
        <input type="radio" name="visibility" value="public" />
        <div class="radio-info">
          <span class="radio-title">Public</span>
          <span class="radio-desc">Anyone can see this organization.</span>
        </div>
      </label>
      <label class="radio-label">
        <input type="radio" name="visibility" value="private" checked />
        <div class="radio-info">
          <span class="radio-title">Private</span>
          <span class="radio-desc"
            >You choose who can see this organization.</span
          >
        </div>
      </label>
    </div>

    <button class="btn btn-primary">Create Organization</button>
  </form>
</div>

<style>
  .container-sm {
    max-width: 600px;
    padding-top: 2rem;
  }
  .subtitle {
    color: var(--muted-foreground);
    margin-bottom: 2rem;
  }

  .orgs-list {
    margin-bottom: 2rem;
  }
  .org-item {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem;
    margin-bottom: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .btn-sm {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }

  .create-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .help-text {
    font-size: 0.8rem;
    color: var(--muted-foreground);
  }

  .alert-error {
    background: var(--destructive);
    color: white;
    padding: 0.75rem;
    border-radius: var(--radius);
  }

  hr {
    border: 0;
    border-top: 1px solid var(--border);
    margin: 2rem 0;
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .radio-label {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    cursor: pointer;
  }
  .radio-info {
    display: flex;
    flex-direction: column;
  }
  .radio-title {
    font-weight: 500;
  }
  .radio-desc {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }
</style>
