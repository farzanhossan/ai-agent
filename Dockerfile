FROM node:22-alpine

WORKDIR /app

COPY . .

RUN yarn
RUN yarn build


RUN ["chmod", "+x", "./entrypoint.sh"]

ENTRYPOINT [ "sh", "./entrypoint.sh" ]