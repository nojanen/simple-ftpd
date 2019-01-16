FROM node:8.11.3-alpine
WORKDIR /usr/src
COPY . .
RUN npm install
CMD [ "npm", "start" ]
