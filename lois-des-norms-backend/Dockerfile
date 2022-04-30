FROM node:alpine
WORKDIR /app
COPY package*.json ./
RUN npm install -g typescript ts-node
RUN npm i
COPY ./ ./
RUN npx prisma generate
RUN npm run build
USER node
CMD ["npm", "run", "start"]
