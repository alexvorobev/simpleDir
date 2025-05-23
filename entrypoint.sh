#!/bin/sh
# entrypoint.sh

# Set default values if not set
export BASE_PATH=${BASE_PATH:-/test}
export NEXT_PUBLIC_BASE_PATH=${BASE_PATH}
export PORT=${PORT:-3000}
export HOSTNAME=${HOSTNAME:-"0.0.0.0"}

echo "Starting SimpleDir with BASE_PATH: $BASE_PATH"

# Run the application
exec "$@"