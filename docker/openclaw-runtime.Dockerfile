FROM node:22-bookworm

ARG OPENCLAW_VERSION=2026.2.17

RUN npm install -g "openclaw@${OPENCLAW_VERSION}" \
  && npm cache clean --force

WORKDIR /home/node
ENV NODE_ENV=production
ENV HOME=/home/node

ENTRYPOINT ["openclaw"]
CMD ["gateway", "run", "--allow-unconfigured"]
