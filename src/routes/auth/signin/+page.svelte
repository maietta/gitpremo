<script lang="ts">
  import { preventDefault } from "svelte/legacy";

  import { authClient } from "$lib/client/auth";

  let email = $state("");
  let password = $state("");
  let loading = $state(false);
  let error = $state("");

  async function handleSignIn() {
    loading = true;
    error = "";
    try {
      const res = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/explore", // Redirect after login
      });
      if (res.error) {
        error = res.error.message || "Failed to sign in";
      }
      // Success handles redirect automatically if handled by callbackURL,
      // or we can router.push here. callbackURL is safer.
    } catch (e: any) {
      error = e.message || "An error occurred";
    } finally {
      loading = false;
    }
  }
</script>

<div class="auth-container">
  <div class="auth-card">
    <h1>Sign In</h1>
    <p class="subtitle">Welcome back to GitPremo</p>

    {#if error}
      <div class="alert-error">{error}</div>
    {/if}

    <form onsubmit={preventDefault(handleSignIn)} class="auth-form">
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
          placeholder="••••••••"
        />
      </div>

      <button type="submit" class="btn btn-primary" disabled={loading}>
        {loading ? "Signing In..." : "Sign In"}
      </button>
    </form>

    <div class="auth-footer">
      <p>Don't have an account? <a href="/auth/signup">Sign Up</a></p>
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
