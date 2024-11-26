
# Use Node.js base image
FROM node:18-alpine


# Set the working directory in the container
ENV NODE_ENV 'devlopment'
RUN apk add --no-cache make gcc g++ python3

WORKDIR /back-end

# Copy package.json and package-lock.json
COPY package*.json ./
COPY . .

# Install dependencies
RUN npm install
RUN npm install axios
RUN npm rebuild bcrypt --build-from-source

# Copy application folders and files into the container


# Expose the application's port (matches `process.env.PORT`)
EXPOSE 8080

# Define the command to run the app
CMD ["node", "index.js"]
