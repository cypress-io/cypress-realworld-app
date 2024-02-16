FROM node:18-alpine

WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install

COPY . .

ENV PORT 3000
EXPOSE 3000

CMD ["yarn", "vite", "--host=0.0.0.0"]
