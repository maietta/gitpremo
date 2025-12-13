#!/bin/bash

# This script is executed by sshd as:
# gitpremo-shell <user_id>
# Environment variable SSH_ORIGINAL_COMMAND contains the git command.

if [ -f /etc/gitpremo/config ]; then
    source /etc/gitpremo/config
fi

USER_ID=$1
COMMAND=$SSH_ORIGINAL_COMMAND
API_URL="${AUTH_API_URL:-http://localhost:5173/api/ssh/authorize}"
REPO_ROOT="${REPO_ROOT:-/data/orgs}"

if [ -z "$COMMAND" ]; then
    echo "Welcome to GitPremo! Interactive shell is disabled."
    exit 1
fi

# Authorize
JSON="{\"userId\": \"$USER_ID\", \"originalCommand\": \"$COMMAND\"}"
RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$JSON" "$API_URL")

ALLOWED=$(echo "$RESPONSE" | jq -r '.allowed')
RELATIVE_PATH=$(echo "$RESPONSE" | jq -r '.relativePath')
ERROR=$(echo "$RESPONSE" | jq -r '.error')

if [ "$ALLOWED" != "true" ]; then
    echo "Access denied: $ERROR"
    exit 1
fi

# Construct absolute path for container
REPO_PATH="${REPO_ROOT}/${RELATIVE_PATH}"

# Execute
# Extract the command (git-upload-pack or git-receive-pack)
GIT_CMD=$(echo "$COMMAND" | awk '{print $1}')

# Run git-shell
# git-shell -c "git-upload-pack '/path/to/repo.git'"
exec git-shell -c "$GIT_CMD '$REPO_PATH'"
