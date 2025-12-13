<script lang="ts">
  import { preventDefault } from "svelte/legacy";

  import { authClient } from "$lib/client/auth";

  let name = $state("");
  let email = $state("");
  let password = $state("");
  let loading = $state(false);
  let error = $state("");

  async function handleSignUp() {
    loading = true;
    error = "";
    try {
      const res = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/explore",
      });
      if (res.error) {
        error = res.error.message || "Failed to sign up";
      }
    } catch (e: any) {
      error = e.message || "An error occurred";
    } finally {
      loading = false;
    }
  }
</script>

<div class="auth-container">
  <div class="auth-card">
    <h1>Sign Up</h1>
    <p class="subtitle">Create your GitPremo account</p>

    {#if error}
      <div class="alert-error">{error}</div>
    {/if}

    <form onsubmit={preventDefault(handleSignUp)} class="auth-form">
      <div class="form-group">
        <label for="name">Name</label>
        <input
          type="text"
          id="name"
          bind:value={name}
          required
          placeholder="Your Name"
        />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          bind:value={email}
          required
          placeholder="you@example.com"
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          bind:value={password}
          required
          placeholder="Start with a strong password"
        />
      </div>

      <button type="submit" class="btn btn-primary" disabled={loading}>
        {loading ? "Creating Account..." : "Sign Up"}
      </button>
    </form>

    <div class="auth-footer">
      <p>Already have an account? <a href="/auth/signin">Sign In</a></p>
    </div>
  </div>
</div>

<style>
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
  }

  .auth-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 2rem;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  h1 {
    text-align: center;
    margin-bottom: 0.5rem;
  }
  .subtitle {
    text-align: center;
    color: var(--muted-foreground);
    margin-bottom: 2rem;
  }

  .auth-form {
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
    font-size: 0.9rem;
  }

  .alert-error {
    background: var(--destructive);
    color: white;
    padding: 0.75rem;
    border-radius: var(--radius);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .auth-footer {
    margin-top: 1.5rem;
    text-align: center;
    font-size: 0.9rem;
    color: var(--muted-foreground);
  }
  .auth-footer a {
    color: var(--primary);
    text-decoration: none;
  }
  .auth-footer a:hover {
    text-decoration: underline;
  }
</style>
