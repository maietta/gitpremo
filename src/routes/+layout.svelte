<script lang="ts">
  import "../app.css";
  import { goto } from "$app/navigation";
  import { authClient } from "$lib/client/auth";
  import { page } from "$app/stores";
  let { data, children } = $props();

  let user = $derived(data.user);

  async function handleSignOut() {
    await authClient.signOut();
    goto("/");
  }
</script>

<div class="app-layout">
  <header class="main-header">
    <div class="container header-content">
      <a href="/" class="logo">GitPremo</a>

      <nav>
        <a href="/explore" class="nav-link">Explore</a>
        {#if user}
          <a href="/new" class="nav-link">New Repo</a>
          <div class="user-menu-wrapper">
            <div class="user-trigger">
              <img
                src={user.image || "https://github.com/ghost.png"}
                alt={user.name}
                class="avatar"
              />
              <span>{user.name}</span>
            </div>
            <div class="user-dropdown">
              <a href="/settings/profile">Profile (Username)</a>
              <a href="/settings/organizations">Organizations</a>
              <a href="/settings/keys">SSH Keys</a>
              <hr />
              <button class="btn-link" onclick={handleSignOut}>Sign Out</button>
            </div>
          </div>
        {:else}
          <a href="/auth/signin" class="btn btn-primary">Sign In</a>
        {/if}
      </nav>
    </div>
  </header>

  <main class="container">
    {@render children?.()}
  </main>
</div>

<style>
  .app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .main-header {
    border-bottom: 1px solid #ccc;
    padding: 1rem 0;
    margin-bottom: 2rem;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    font-weight: 700;
    font-size: 1.5rem;
    text-decoration: none;
    color: inherit;
  }

  nav {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .nav-link {
    text-decoration: none;
    color: inherit;
  }

  .nav-link:hover {
    text-decoration: underline;
  }

  .avatar {
    width: 32px;
    height: 32px;
    object-fit: cover;
  }

  /* Dropdown Logic */
  .user-menu-wrapper {
    position: relative;
  }

  .user-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.25rem;
  }

  .user-dropdown {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    width: 200px;
    background: white; /* Needed for visibility over content */
    border: 1px solid #ccc;
    padding: 0.5rem 0;
    z-index: 100;
    flex-direction: column;
  }

  .user-menu-wrapper:hover .user-dropdown {
    display: flex;
  }

  .user-dropdown a,
  .user-dropdown button {
    display: block;
    padding: 0.5rem 1rem;
    text-decoration: none;
    color: inherit;
    text-align: left;
    background: none;
    border: none;
    font-size: 0.9rem;
    cursor: pointer;
    width: 100%;
    box-sizing: border-box;
  }

  .user-dropdown a:hover,
  .user-dropdown button:hover {
    background: #f0f0f0;
  }

  .user-dropdown hr {
    border: 0;
    border-top: 1px solid #ccc;
    margin: 0.25rem 0;
  }
</style>
