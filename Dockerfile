FROM ghcr.io/puppeteer/puppeteer

USER 0
RUN corepack enable && corepack prepare pnpm@latest --activate
USER 1000

WORKDIR /code
COPY package.json pnpm-lock.yaml /code/
RUN pnpm i
COPY . /code

CMD npm start
