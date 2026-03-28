# Multi-entrypoint Dockerfile for Driver App

FROM node:18-alpine

WORKDIR /app

# We will mount the volume, so we just need the environment setup
# But for a standalone image, we would copy users code. 
# Here we assume a development setup via docker-compose volume mapping.

# Install dependencies for both Frontend and Backend
# (Ideally, these should be separate, but for a simple dev setup we can keep them managed by the host or install via script)

CMD ["sh", "-c", "echo 'Please use docker-compose to run specific services'"]
