FROM node:12.18

# Create app directory
WORKDIR /usr/src/stugan

# Install dependencies
COPY package*.json ./
RUN npm install

# Stuga web app sources
COPY . ./

EXPOSE 8080
CMD [ "npm", "start" ]


