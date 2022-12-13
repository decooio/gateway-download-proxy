FROM node:14-alpine
WORKDIR /app
COPY dist ./dist
COPY node_modules ./node_modules
EXPOSE 5051
CMD ["node", "./dist/index.js"]
