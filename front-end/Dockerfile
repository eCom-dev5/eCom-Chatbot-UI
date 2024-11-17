FROM node:18-alpine

WORKDIR /front-end


RUN npm install
RUN npm install react-scripts --save

COPY ./package.json ./
COPY public ./public
COPY .env .

COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]
