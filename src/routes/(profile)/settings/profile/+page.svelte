<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  interface Props {
    data: PageData;
    form: ActionData;
  }

  let { data, form }: Props = $props();
</script>

<div class="container container-sm">
  <h1>Public Profile</h1>
  <p class="subtitle">This is how others will see you on the site.</p>

  <form method="POST" action="?/save" class="settings-form">
    {#if form?.error}
      <div class="alert-error">{form.error}</div>
    {/if}
    {#if form?.success}
      <div class="alert-success">Profile updated.</div>
    {/if}

    <div class="form-group">
      <label for="username">Username</label>
      <input
        type="text"
        name="username"
        id="username"
        value={data.profileNamespace?.slug || ""}
        readonly={!!data.profileNamespace}
        placeholder="pick-a-username"
      />
      {#if data.profileNamespace}
        <p class="help-text">Username cannot be changed once set.</p>
      {:else}
        <p class="help-text">
          Choose wisely. This will be your URL namespace: <code
            >gitpremo.com/username</code
          >
        </p>
      {/if}
    </div>

    {#if !data.profileNamespace}
      <button class="btn btn-primary">Set Username</button>
    {/if}
  </form>
</div>

<style>
  .container-sm {
    max-width: 600px;
    padding-top: 2rem;
  }
  h1 {
    margin-bottom: 0.5rem;
  }
  .subtitle {
    margin-bottom: 2rem;
    border-bottom: 1px solid #ccc;
    padding-bottom: 1rem;
  }

  .settings-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  label {
    font-weight: 500;
  }
  .help-text {
    font-size: 0.8rem;
  }

  .alert-success {
    background: #eee;
    padding: 0.75rem;
  }
  .alert-error {
    background: #fee;
    color: red;
    padding: 0.75rem;
  }
</style>
