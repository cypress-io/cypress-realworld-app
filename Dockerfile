FROM node:20.7.0-alpine AS build
WORKDIR /app

COPY package.json yarn.lock .yarnrc ./

RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true yarn install

COPY . .

RUN yarn build

# smaller image for production
FROM node:20.7-slim
WORKDIR /app

COPY --from=build /app/package.json .
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000

# start app
CMD ["yarn", "dev"]