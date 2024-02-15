FROM nullstone/node:latest

COPY package.json .
COPY yarn.lock .
RUN NODE_ENV=dev yarn install

COPY . .

ENV PORT 3001
EXPOSE 3001

CMD ["yarn", "tsnode", "--files", "backend/app.ts"]
