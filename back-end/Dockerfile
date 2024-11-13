
# Use Node.js base image
FROM node:18-alpine
ENV NODE_ENV=production

# Set the working directory in the container
WORKDIR /back-end

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --silent
RUN npm install axios


# Copy application folders and files into the container
COPY routes ./routes
COPY documentation ./documentation
COPY db ./db
COPY auth.js .
COPY index.js .
COPY .env .env
COPY . .


# Step 6: Set environment variables (the PORT variable is required by Cloud Run)
ENV PORT=8080

# Step 7: Expose the PORT so Cloud Run knows where to listen
EXPOSE 8080



# Define the command to run the app
CMD ["node", "index.js"]
