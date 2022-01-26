FROM mhart/alpine-node:14 AS builder
WORKDIR /home/node/app
COPY package.json ./

RUN yarn install --frozen-lockfile
RUN npm prune --production
COPY . .




EXPOSE 3001
CMD ["node", "./index.js"]