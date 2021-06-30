FROM node:16-alpine
COPY package.json package-lock.json ./
RUN npm install && mkdir /rs && mv ./node_modules ./rs
WORKDIR /rs
COPY . .

FROM nginx:alpine
COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /usr/share/nginx/html/*
COPY /build /usr/share/nginx/html

ENTRYPOINT ["nginx", "-g", "daemon off;"]