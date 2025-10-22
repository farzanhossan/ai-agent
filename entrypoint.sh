#!/bin/bash

# yarn db:migration:run
yarn db:seed
node dist/main.js