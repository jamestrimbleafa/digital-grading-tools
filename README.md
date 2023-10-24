# TAMS Tools for eLearning

A set of tools for teaching and learning computer science. Developed by Laszlo Korte <me@laszlokorte.de> as part of the Thesis *A JavaScript framework for interactive presentations and animations on computer science*.

Demo: https://thesis.laszlokorte.de

## Getting started

### Using Docker

`docker run -it -v [Path to Repo]:/digital-grading-tools/ -p 3000:3000 node:16.20.2-buster /bin/bash`

Then `cd /digital-grading-tools/` and follow the rest of the instructions below.

### Installing Locally

First you need to make sure you have installed `node`(v5.1.0) and `npm`(3.5.0) on your system.

`node` can be downloaded at https://nodejs.org/en/ `npm` is included.

Then just run:

```shell
$ npm install
```

And to start the development server

```shell
$ npm start
```

Now you can open `http://localhost:3000` in your browser

## Build

To build a release version just run

```shell
$ npm run compile
```

The output will be saved into the `./build` folder.

## More

See the `docs` folder for further explanation
