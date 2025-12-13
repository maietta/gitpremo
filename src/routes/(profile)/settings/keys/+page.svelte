<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  interface Props {
    data: PageData;
    form: ActionData;
  }

  let { data, form }: Props = $props();
</script>

<div class="container container-sm">
  <h1>SSH Keys</h1>
  <p class="subtitle">Manage SSH keys for git access.</p>

  <div class="keys-list">
    {#each data.keys as key}
      <div class="key-item">
        <div class="key-info">
          <strong>{key.name}</strong>
          <code class="key-preview">{key.publicKey.substring(0, 30)}...</code>
        </div>
        <form
          method="POST"
          action="?/delete"
          onsubmit={(e) => {
            if (!confirm("Are you sure you want to delete this SSH key?")) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={key.id} />
          <button class="btn btn-ghost btn-danger">Delete</button>
        </form>
      </div>
    {:else}
      <p>No keys added yet.</p>
    {/each}
  </div>

  <hr />

  <h3>Add New Key</h3>
  <form method="POST" action="?/add" class="add-form">
    {#if form?.error}
      <div class="alert-error">{form.error}</div>
    {/if}

    <div class="form-group">
      <label for="name">Title</label>
      <input type="text" name="name" id="name" placeholder="Laptop" required />
    </div>

    <div class="form-group">
      <label for="key">Key</label>
      <textarea
        name="key"
        id="key"
        rows="5"
        placeholder="ssh-rsa AAAAB3NzaC1yc2E..."
        required
      ></textarea>
    </div>

    <button class="btn btn-primary">Add Key</button>
  </form>
</div>

<style>
  .container-sm {
    max-width: 800px;
    padding-top: 2rem;
  }
  .subtitle {
    color: var(--muted-foreground);
    margin-bottom: 2rem;
  }

  .keys-list {
    margin-bottom: 2rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .key-item {
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .key-item:last-child {
    border-bottom: none;
  }
  .key-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .key-preview {
    font-size: 0.8rem;
    color: var(--muted-foreground);
    background: var(--muted);
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
  }

  .btn-danger {
    color: var(--destructive);
  }
  .btn-danger:hover {
    background: #fee2e2;
  } /* destructive-light */

  .add-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
  }
  textarea {
    font-family: monospace;
    resize: vertical;
  }
</style>
