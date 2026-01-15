FROM node:22-bullseye

WORKDIR /app

# repo expects Yarn Classic (v1) via corepack
RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

COPY . .

# Render will provide PORT for the public listener (proxy uses it)
CMD ["bash", "-lc", "node render-proxy.js"]
