FROM ghcr.io/puppeteer/puppeteer

USER 0
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /code
COPY package.json pnpm-lock.yaml /code/
RUN pnpm i
COPY . /code
RUN npm run build && npx prisma generate

CMD npm run start:prod
