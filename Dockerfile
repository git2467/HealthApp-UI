# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application's source code into the container
COPY . .

# Build the React app for production
RUN npm run build

# Serve the built app using a lightweight HTTP server
RUN npm install -g serve

# Expose port 3000 to access the app
EXPOSE 3000

# Run the application
CMD ["serve", "-s", "build", "-l", "3000"]