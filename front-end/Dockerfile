FROM node:18-alpine

WORKDIR /front-end
COPY ./package*.json ./
COPY public ./public

RUN npm install 


COPY . .

# Expose the Cloud Run port (usually 8080)
EXPOSE 3000

CMD [ "npm", "start" ]
