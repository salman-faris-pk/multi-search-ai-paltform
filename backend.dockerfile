# FROM node:22-alpine

# ARG SEARXNG_API_URL
# ENV SEARXNG_API_URL=${SEARXNG_API_URL}

# WORKDIR /home/futuresearch

# COPY src /home/futuresearch/src

# COPY tsconfig.json /home/futuresearch/
# COPY config.toml /home/futuresearch/
# COPY package.json /home/futuresearch/
# COPY package-lock.json /home/futuresearch/


#     # substitute    old                new     
# RUN sed -i "s|SEARXNG_API_URL=\".*\"|SEARXNG_API_URL=\"${SEARXNG_API_URL}\"|g" /home/futuresearch/config.toml
#                                          #here the searxng value in congif.toml file will replaced by env searxng,This replacement happens during build time

# RUN npm install
# RUN npm run build

# CMD [ "npm","start" ]


FROM node:20-alpine AS builder

ARG SEARXNG_API_URL
ENV SEARXNG_API_URL=$SEARXNG_API_URL

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production=false

COPY src ./src
COPY tsconfig.json .
COPY config.toml .

  
RUN sed -i "s|SEARXNG_API_URL=\".*\"|SEARXNG_API_URL=\"${SEARXNG_API_URL}\"|g" config.toml
                        #here the searxng value in congif.toml file will replaced by env searxng,This replacement happens during build time

RUN npm run build

RUN npm ci --only=production --frozen-lockfile



FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/config.toml .

EXPOSE 3003

USER nonroot

CMD ["dist/app.js"]