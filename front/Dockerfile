FROM node:20
WORKDIR /front
COPY . .
RUN npm i
EXPOSE 5173
CMD ["npx", "vite", "--host"]
