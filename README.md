# morphaux

Test framework

## Build

    npm install
    npm run build

## Run

Starting 

    node bin/test.js up stackname provider service

Deleting

    node bin/test.js dn stackname provider service


## Dependencies

    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash

    nvm install --lts

    npm --version
    8.11.0

    node --version
    v17.9.1

    curl -sSL https://get.pulumi.com | sh

    pulumi login file://~