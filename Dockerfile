FROM node:20-alpine AS base

WORKDIR /app

# Instalar dependencias de base
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar código
COPY . .

# Expor porta
EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]