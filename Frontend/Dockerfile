FROM node:22-alpine

WORKDIR /SkillForge

COPY package*.json ./

RUN npm install

COPY . .

ARG VITE_API_URI

ENV VITE_API_URI=$VITE_API_URI



RUN npm run build

EXPOSE 5173

CMD ["npm","run","preview"]