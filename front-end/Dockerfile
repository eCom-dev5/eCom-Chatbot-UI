# Use a node image as the base
FROM node:18 as build

# Set the working directory
WORKDIR /front-end

# Copy package.json and package-lock.json files
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY ./src ./src
COPY public ./public
COPY .env .

# Build the TypeScript application
RUN npm run build

# Use a lightweight server to serve the production build
FROM nginx:alpine

# Copy the build output from the build stage to the Nginx HTML folder
COPY --from=build /front-end/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
