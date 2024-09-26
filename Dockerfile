FROM node:21.7.1-bookworm-slim
RUN apt-get update -y && apt-get install -y openssl
