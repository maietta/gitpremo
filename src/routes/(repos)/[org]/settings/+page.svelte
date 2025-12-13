<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import { enhance } from "$app/forms";

  let { data, form } = $props<{ data: PageData; form: ActionData }>();
  let { namespace } = data;

  let avatarPreview = $state(namespace.avatar);

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
</script>

<div class="container container-md">
  <div class="header">
    <h1>Settings</h1>
    <p class="subtitle">Update your organization profile.</p>
  </div>

  <form
    method="POST"
    action="?/update"
    enctype="multipart/form-data"
    use:enhance
  >
    {#if form?.error}
      <div class="alert alert-error">{form.error}</div>
    {/if}
    {#if form?.success}
      <div class="alert alert-success">Profile updated successfully.</div>
    {/if}

    <div class="form-section">
      <div class="form-group avatar-group">
        <label for="avatar">Profile Picture</label>
        <div class="avatar-container">
          {#if avatarPreview}
            <img src={avatarPreview} alt="Avatar" class="avatar-preview" />
          {:else}
            <div class="avatar-placeholder">
              {namespace.slug[0].toUpperCase()}
            </div>
          {/if}
          <div class="file-input-wrapper">
            <input
              type="file"
              name="avatar"
              id="avatar"
              accept="image/*"
              onchange={handleFileChange}
            />
            <span class="help-text">JPG, GIF or PNG. Max size of 2MB.</span>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="name">Name</label>
        <input
          type="text"
          name="name"
          id="name"
          value={namespace.name || ""}
          placeholder="Organization Name"
        />
      </div>

      <div class="form-group">
        <label for="publicEmail">Public Email</label>
        <input
          type="email"
          name="publicEmail"
          id="publicEmail"
          value={namespace.publicEmail || ""}
          placeholder="contact@example.com"
        />
        <span class="help-text">Visible to the public.</span>
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          name="description"
          id="description"
          rows="3"
          placeholder="Tell us about yourself"
          >{namespace.description || ""}</textarea
        >
      </div>

      <div class="form-group">
        <label for="website">URL</label>
        <input
          type="url"
          name="website"
          id="website"
          value={namespace.website || ""}
          placeholder="https://example.com"
        />
      </div>

      <div class="form-group">
        <label for="location">Location</label>
        <input
          type="text"
          name="location"
          id="location"
          value={namespace.location || ""}
          placeholder="San Francisco, CA"
        />
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            name="isPrivate"
            id="isPrivate"
            checked={namespace.isPrivate}
          />
          <span>Private Organization</span>
        </label>
        <span class="help-text"
          >If private, this organization and its repositories will be hidden
          from the explore page.</span
        >
      </div>

      <button type="submit" class="btn btn-primary">Update profile</button>
    </div>
  </form>
</div>

<style>
  .container-md {
    max-width: 900px;
    padding-top: 2rem;
  }
  .header {
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--border);
    padding-bottom: 1rem;
  }
  .subtitle {
    color: var(--muted-foreground);
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .avatar-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .avatar-container {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .avatar-preview,
  .avatar-placeholder {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--border);
  }

  .avatar-placeholder {
    background: var(--muted);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: 600;
    color: var(--muted-foreground);
  }

  .file-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .help-text {
    font-size: 0.8rem;
    color: var(--muted-foreground);
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    cursor: pointer;
  }

  .input-error {
    border-color: var(--destructive);
  }

  .alert {
    padding: 0.75rem 1rem;
    border-radius: var(--radius);
    margin-bottom: 1.5rem;
  }
  .alert-error {
    background: #fee2e2;
    color: #991b1b;
  }
  .alert-success {
    background: #dcfce7;
    color: #166534;
  }
</style>
