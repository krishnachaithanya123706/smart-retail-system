# Use lightweight official Node 18 Alpine image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install --production

# Copy application source code
COPY server.js data.js ./
COPY public ./public

# Expose server port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=5000

# Start the Smart Retail System Express server
CMD ["npm", "start"]
