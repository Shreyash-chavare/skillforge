FROM node:22-alpine

WORKDIR /SkillForge

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["node","app.js"]