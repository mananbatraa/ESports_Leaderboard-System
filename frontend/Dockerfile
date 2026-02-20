# ---------- BUILD STAGE ----------
FROM node:18 AS build
WORKDIR /app

# Copy package.json and lock file
COPY app/package.json app/package-lock.json ./

# Install dependencies
RUN npm install

# Copy entire React app
COPY app ./

# Build production
RUN npm run build

# ---------- NGINX SERVE STAGE ----------
FROM nginx:latest
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
