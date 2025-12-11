# FROM node:22-alpine



# ARG NEXT_PUBLIC_WS_URL
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
# ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# WORKDIR /home/futuresearch

# COPY ui /home/futuresearch/


# RUN npm install
# RUN npm run build

# CMD [ "npm", "start"]


FROM node:20-alpine AS builder

# Arguments
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

COPY ui/package*.json ./

# Install all dependencies (dev included) for build
RUN npm ci

COPY ui ./

RUN npm run build

# Remove dev dependencies to reduce size before copying to runner
RUN npm prune --production


# ---------- Runner Stage ----------
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
