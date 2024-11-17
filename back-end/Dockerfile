
# Use Node.js base image
FROM node:18-alpine


# Set the working directory in the container
ENV NODE_ENV 'production'

WORKDIR /back-end

# Copy package.json and package-lock.json
COPY package*.json ./
RUN npm install --production
ENV HOSTNAME=0.0.0.0
ENV PORT=8080

# Install dependencies
RUN npm install
RUN npm install axios
RUN npm ci
RUN npm install -g firebase-tools

COPY ./back-end/index.js ./index.js


# Copy application folders and files into the container

Copy . .

# Expose the application's port (matches `process.env.PORT`)
EXPOSE 8080

# Define the command to run the app
CMD ["node", "index.js"]
