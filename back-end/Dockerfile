
# Use Node.js base image
FROM node:18-alpine


# Set the working directory in the container
ENV NODE_ENV 'development'

WORKDIR /back-end

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install axios
RUN npm ci

COPY index.js ./index.js

COPY routes ./routes
COPY db ./db


# Copy application folders and files into the container

Copy . .

# Expose the application's port (matches `process.env.PORT`)
EXPOSE 8080

# Define the command to run the app
CMD ["node", "index.js"]
