FROM node:18-alpine3.15

WORKDIR /app

# Copy package.json and package-lock.json
COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm install

# Copy the rest of the application
COPY . .

# Build the React app for production
RUN npm run build

# Expose the Cloud Run port (usually 8080)
EXPOSE 8080

# Serve the production build on the specified PORT
CMD ["npm", "start"]