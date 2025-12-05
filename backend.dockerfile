FROM node:buster-slim

ARG SEARXNG_API_URL
ENV SEARXNG_API_URL=${SEARXNG_API_URL}

WORKDIR /home/futuresearch

COPY src /home/futuresearch/src

COPY tsconfig.json /home/futuresearch/
COPY config.toml /home/futuresearch/
COPY package.json /home/futuresearch/
COPY package-lock.json /home/futuresearch/


    # substitute    old                new     
RUN sed -i "s|SEARXNG_API_URL=\".*\"|SEARXNG_API_URL=\"${SEARXNG_API_URL}\"|g" /home/futuresearch/config.toml
                                         #here the searxng value in congif.toml file will replaced by env searxng,This replacement happens during build time

RUN npm install
RUN npm run build

CMD [ "npm","start" ]