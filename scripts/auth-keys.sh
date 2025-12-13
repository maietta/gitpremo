#!/bin/bash

# Configuration
if [ -f /etc/gitpremo/config ]; then
    source /etc/gitpremo/config
fi
API_URL="${API_URL:-http://localhost:5173/api/ssh/keys}"

# Fetch keys
curl -s "$API_URL"
