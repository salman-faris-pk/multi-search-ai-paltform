FROM node:buster-slim

ARG SEARXNG_API_URL
ENV SEARXNG_API_URL=${SEARXNG_API_URL}

WORKDIR /home/futuresearch

COPY src /home/futuresearch/src

COPY tsconfig.json /home/futuresearch/
COPY .env /home/futuresearch/
COPY package.json /home/futuresearch/
COPY package-lock.json /home/futuresearch/



RUN npm install
RUN npm run build

CMD [ "npm","start" ]