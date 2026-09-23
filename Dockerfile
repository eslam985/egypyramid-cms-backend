FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Hugging Face يتطلب الاستماع على المنفذ 7860
EXPOSE 7860
ENV PORT=7860

CMD ["npm", "start"]