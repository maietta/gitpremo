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

## Project Structure

- `src/lib/server/git`: Core git operations handler.
- `src/lib/server/db`: Database schema and connection logic (Main DB + Tenant DBs).
- `src/routes/(repos)`: Repository browsing, organization profiles, and git management routes.
- `src/routes/(profile)`: User settings and profile management.
- `data/`: Storage location for SQLite databases and bare git repositories.

## License

MIT
