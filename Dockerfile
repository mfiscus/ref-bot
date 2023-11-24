FROM node:21

RUN mkdir -p /home/node/app/node_modules && \
    chown -R node:node /home/node/app && \
    mkdir -p /config && \
    chown -R node:node /config && \
    touch /config/config.json && \
    chown -R node:node /config/config.json && \
    ln -s /config/config.json /home/node/app/config.json

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

CMD [ "node", "." ]