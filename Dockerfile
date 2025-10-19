# base node image
FROM node:20-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /remixapp

ADD package.json package-lock.json ./

RUN npm ci --include=dev && npm cache clean --force

# Setup production node_modules
FROM base as production-deps

WORKDIR /remixapp

COPY --from=deps /remixapp/node_modules /remixapp/node_modules
ADD package.json package-lock.json ./
RUN npm prune --omit=dev

# Build the app
FROM base as build

WORKDIR /remixapp

COPY --from=deps /remixapp/node_modules /remixapp/node_modules
ADD package.json package-lock.json postcss.config.js tailwind.config.ts tsconfig.json vite.config.ts components.json ./
ADD prisma/ prisma/
ADD app/ app/
ADD public/ public/

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

ENV NODE_ENV=production

WORKDIR /remixapp

# Copy production dependencies
COPY --from=production-deps /remixapp/node_modules /remixapp/node_modules

# Copy built application
COPY --from=build /remixapp/build /remixapp/build
COPY --from=build /remixapp/package.json /remixapp/package.json

# Copy prisma for runtime (needed for migrations and client)
COPY --from=build /remixapp/prisma /remixapp/prisma

# Create a non-root user for security
RUN groupadd --gid 1001 --system nodejs && \
    useradd --uid 1001 --system --gid nodejs --create-home --shell /bin/bash nodejs

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /remixapp
USER nodejs

CMD ["npm", "start"]