FROM node:alpine
WORKDIR /app
COPY package.json /app
COPY package-lock.json /app
COPY ./ /app
RUN npm install -g typescript
RUN npm install -g ts-node
RUN npm i
RUN npm run build
USER node
CMD ["npm", "run", "start"]