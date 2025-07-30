# --- Stage 1 - Build the React Application
FROM node:18 AS build

WORKDIR app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

# -- Stage 2 - Serve the app using nginx
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

# No need to expose port 80 as it exposed by default
# The default nginx command will start by default