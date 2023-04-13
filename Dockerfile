FROM ghcr.io/puppeteer/puppeteer

WORKDIR /code
COPY package.json pnpm-lock.yaml /code
RUN npm i
COPY . /code

CMD npm start
