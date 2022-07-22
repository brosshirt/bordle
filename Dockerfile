FROM node:18-alpine
WORKDIR /usr/src/app

# Copy installation files to work dir and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source to work dir
COPY . .
EXPOSE 3000

# Start bordle server
CMD ["node", "app.js"]



