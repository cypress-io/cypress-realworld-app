FROM node:18.16.1-alpine AS build
WORKDIR /app

COPY package.json yarn.lock .yarnrc vite.config.ts ./

RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true yarn install

COPY . .

# start app
CMD ["yarn", "dev"]