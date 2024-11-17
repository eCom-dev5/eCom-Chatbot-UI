FROM node:18-alpine

WORKDIR /front-end


RUN npm install
RUN npm install react-scripts --save

COPY ./package.json ./
COPY public ./public
COPY .env .

COPY . .

# Expose the Cloud Run port (usually 8080)
EXPOSE 8080

CMD [ "npm", "start" ]
