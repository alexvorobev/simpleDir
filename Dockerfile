# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Copy entrypoint script and make it executable
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN yarn next telemetry enable
RUN yarn build

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start the application
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]