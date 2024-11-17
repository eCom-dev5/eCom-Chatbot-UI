# Use a node image as the base
FROM node:18 as build

# Set the working directory
WORKDIR /front-end

# Copy package.json 
COPY package*.json ./

# Install dependencies
RUN npm install --silent
RUN npm install react-scripts --save


# Copy the rest of the application code
# COPY ./src ./src
# COPY public ./public
COPY . /front-end

# Build the TypeScript application
# RUN npm Start

# Use a lightweight server to serve the production build

# Copy the build output from the build stage to the Nginx HTML folder
# COPY --from=build /front-end/build /usr/share/nginx/html

# Expose port 80
ENV PORT 3000

# Start Nginx server
CMD ["npm", "start"]
