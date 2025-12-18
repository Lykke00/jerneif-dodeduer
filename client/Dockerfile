FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 210

# Start with Node's built-in http-server for better control
CMD ["npx", "http-server", "dist", "-p", "210", "-a", "0.0.0.0"]