# GitPremo

A lightweight, self-hosted Git service built for speed and simplicity. GitPremo allows you to host repositories, manage organizations, and collaborate with your team using a familiar interface.

## Features

- **Git Hosting**: Full support for `git push` and `git pull` over both HTTP and SSH.
- **Multi-tenancy**: Organization and User namespaces, each with their own isolated SQLite database for repository metadata.
- **Privacy Controls**:
  - **Private Organizations**: Hide your entire organization from the public explore page.
  - **Private Repositories**: Restrict access to specific repositories within an organization.
- **Explore**: Discover public repositories and organizations across the instance.
- **SSH Key Management**: Users can manage multiple SSH keys for secure access.
- **User Profiles**: Customizable profiles and settings.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [SvelteKit 5](https://svelte.dev)
- **Database**: [SQLite](https://sqlite.org) with [Drizzle ORM](https://orm.drizzle.team)
- **Authentication**: [Better Auth](https://www.better-auth.com)
- **Styling**: [TailwindCSS](https://tailwindcss.com)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed.

### Installation

1.  Clone the repository:

    ```bash
    git clone git@github.com:maietta/gitpremo.git
    cd gitpremo
    ```

2.  Install dependencies:

    ```bash
    bun install
    ```

3.  Start the development server:
    ```bash
    bun dev
    ```

### SSH Testing

The project includes a Dockerized SSH server configuration for testing git-over-ssh locally.

```bash
# Start the SSH test container
docker-compose -f docker-compose.ssh-test.yml up -d
```

## Production SSH Configuration (Linux)

To enable Git operations over SSH on a production Linux server, follow these steps to configure `sshd` and the `git` user.

### 1. Create the `git` User

Create a system user that will handle all Git connections.

```bash
sudo useradd -r -m -s /bin/bash git
```

### 2. Install Dependencies

Ensure `curl` and `jq` are installed for the helper scripts.

```bash
sudo apt-get update && sudo apt-get install -y curl jq
```

### 3. Configure GitPremo Scripts

1.  **Create Config Directory**:

    ```bash
    sudo mkdir -p /etc/gitpremo
    ```

2.  **Create Config File** (`/etc/gitpremo/config`):
    Adjust the URLs and paths to match your environment.

    ```bash
    API_URL="http://localhost:5173/api/ssh/keys"
    AUTH_API_URL="http://localhost:5173/api/ssh/authorize"
    REPO_ROOT="/path/to/gitpremo/data" # Must match where your app stores data
    ```

3.  **Install Scripts**:
    Copy the host scripts to the system bin locations. **Note**: `gitpremo-shell` MUST be at `/usr/bin/gitpremo-shell` as specificed in the application code.

    ```bash
    sudo cp scripts/auth-keys.sh /usr/local/bin/gitpremo-keys
    sudo cp scripts/shell.sh /usr/bin/gitpremo-shell
    sudo chmod +x /usr/local/bin/gitpremo-keys /usr/bin/gitpremo-shell
    ```

### 4. Configure SSHD

Edit `/etc/ssh/sshd_config` to tell SSH where to find authorized keys for the `git` user.

Add the following block to the end of the file:

```ssh
Match User git
    AuthorizedKeysCommand /usr/local/bin/gitpremo-keys
    AuthorizedKeysCommandUser nobody
```

> **Note**: The `Match User git` block ensures that this dynamic key lookup **only** applies to the `git` user. Normal administrative SSH access for other users (e.g., `root`, `ubuntu`) will continue to work using standard `~/.ssh/authorized_keys` files, even if the GitPremo service is down.

### 5. Restart SSH

```bash
sudo systemctl restart ssh
```

## Project Structure

- `src/lib/server/git`: Core git operations handler.
- `src/lib/server/db`: Database schema and connection logic (Main DB + Tenant DBs).
- `src/routes/(repos)`: Repository browsing, organization profiles, and git management routes.
- `src/routes/(profile)`: User settings and profile management.
- `data/`: Storage location for SQLite databases and bare git repositories.

## License

MIT
