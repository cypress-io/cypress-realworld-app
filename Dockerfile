FROM node:alpine

WORKDIR "/app"

# Copy package.json and package-lock.json
COPY package.json ./
COPY yarn.lock ./

# Install npm production packages 
RUN yarn

COPY . /app

EXPOSE 3000
EXPOSE 3001

CMD [ "yarn", "start"]