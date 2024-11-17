FROM node:18-alpine3.15

WORKDIR /app

COPY ./package.json ./
COPY ./package-lock.json ./ 

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run", "start"]
