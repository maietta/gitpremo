<script lang="ts">
  import { untrack } from "svelte";
  import type { PageData, ActionData } from "./$types";
  interface Props {
    data: PageData;
    form: ActionData;
  }

  let { data, form }: Props = $props();

  let namespace = $state(untrack(() => data.namespaces[0]?.slug || ""));
  let repoName = $state("");
  let isChecking = $state(false);
  let isAvailable = $state<boolean | null>(null);
  let checkError = $state<string | null>(null);
  let debounceTimer: Timer;

  function handleNameInput(e: Event) {
    const target = e.target as HTMLInputElement;
    repoName = target.value;
    isAvailable = null;
    checkError = null;

    clearTimeout(debounceTimer);

    if (!repoName.trim()) return;

    if (!/^[a-zA-Z0-9-]+$/.test(repoName)) {
      checkError = "Invalid name. Alphanumeric and dashes only.";
      isAvailable = false;
      return;
    }

    isChecking = true;
    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/repos/check?namespace=${namespace}&name=${repoName}`
        );
        const result = await res.json();
        isAvailable = result.available;
        if (!result.available) {
          checkError = "Repository name already exists.";
        }
      } catch (err) {
        console.error(err);
        checkError = "Failed to check availability.";
      } finally {
        isChecking = false;
      }
    }, 500);
  }
</script>

<div class="container container-sm">
  <h1>Create a new repository</h1>
  <p class="subtitle">
    A repository contains all project files, including the revision history.
  </p>

  <form method="POST" action="?/create" class="create-form">
    {#if form?.error}
      <div class="alert-error">
        {form.error}
      </div>
    {/if}

    <div class="form-group owner-repo-group">
      <div class="input-col">
        <label for="namespace">Owner</label>
        <select name="namespace" id="namespace" bind:value={namespace} required>
          {#each data.namespaces as ns}
            <option value={ns.slug}>{ns.slug}</option>
          {/each}
        </select>
      </div>
      <span class="divider">/</span>
      <div class="input-col">
        <label for="name">Repository name</label>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="my-project"
          required
          pattern="^[a-zA-Z0-9-]+$"
          title="Alphanumeric characters and dashes only"
          bind:value={repoName}
          oninput={handleNameInput}
          class:input-error={isAvailable === false}
          class:input-success={isAvailable === true}
        />
        {#if isChecking}
          <span class="status-text checking">Checking...</span>
        {:else if isAvailable === true}
          <span class="status-text available">✓ Available</span>
        {:else if isAvailable === false}
          <span class="status-text unavailable"
            >✗ {checkError || "Unavailable"}</span
          >
        {/if}
      </div>
    </div>

    <div class="form-group">
      <label for="description"
        >Description <span class="optional">(optional)</span></label
      >
      <input
        type="text"
        name="description"
        id="description"
        placeholder="Short description of your project"
      />
    </div>

    <div class="form-group radio-group">
      <label class="radio-label">
        <input type="radio" name="private" value="off" checked />
        <div class="radio-info">
          <span class="radio-title">Public</span>
          <span class="radio-desc"
            >Anyone on the internet can see this repository.</span
          >
        </div>
      </label>
      <label class="radio-label">
        <input type="radio" name="private" value="on" />
        <div class="radio-info">
          <span class="radio-title">Private</span>
          <span class="radio-desc"
            >You choose who can see and commit to this repository.</span
          >
        </div>
      </label>
    </div>

    <hr />

    <button
      type="submit"
      class="btn btn-primary submit-btn"
      disabled={isAvailable === false}>Create repository</button
    >
  </form>
</div>

<style>
  .container-sm {
    max-width: 800px;
    padding-top: 2rem;
  }

  h1 {
    margin-bottom: 0.5rem;
  }
  .subtitle {
    color: var(--muted-foreground);
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--border);
    padding-bottom: 1rem;
  }

  .create-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background: var(--card);
    padding: 1rem 0;
  }

  .owner-repo-group {
    display: flex;
    align-items: flex-start; /* Changed from flex-end to ensure proper alignment with messages */
    gap: 0.5rem;
  }
  .input-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .divider {
    font-size: 1.5rem;
    padding-top: 1.75rem; /* Adjustable based on label height */
    color: var(--muted-foreground);
  }

  label {
    font-weight: 500;
    font-size: 0.9rem;
  }
  .optional {
    color: var(--muted-foreground);
    font-weight: 400;
  }

  select,
  input[type="text"] {
    background: var(--input);
    background: var(--background);
  }

  .status-text {
    font-size: 0.85rem;
    font-weight: 500;
  }
  .checking {
    color: var(--muted-foreground);
  }
  .available {
    color: #22c55e; /* Green */
  }
  .unavailable {
    color: #ef4444; /* Red */
  }

  .input-error {
    border-color: #ef4444;
  }
  .input-success {
    border-color: #22c55e;
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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

  hr {
    border: 0;
    border-top: 1px solid var(--border);
    width: 100%;
    margin: 1rem 0;
  }

  .submit-btn {
    align-self: flex-start;
  }

  .alert-error {
    background: var(--destructive);
    color: white;
    padding: 0.75rem;
    border-radius: var(--radius);
    font-size: 0.9rem;
  }
</style>
