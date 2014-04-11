Setup
=====

In the console, run:

    git clone https://github.com/dwaltrip/file-browser.git
    cd file-browser
    npm install
    bower install
    mkdir data

Open up a second console and start up mongodb:

    mongod --dbpath ~/Documents/code/node-js/file-browser/data

Now back in first terminal, boot up the app:

    node server.js
