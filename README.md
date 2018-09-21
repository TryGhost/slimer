# Slimer

A lerna mono-repository of tools for working on Ghost and in the surrounding ecosystem.

It mainly provides a CLI tool for quickly starting new projects. 

Slimer is capable of creating 4 different types of project:
- **Pkg:**    create a package inside a mono repo
- **Mono:**   start a new mono repo with lerna, just like the `slimer` repo
- **Module:** a simple standalone node module
- **App:**    a standalone app, based on express

## Install

- `npm i -g @tryghost/slimer-cli`

## Usage

- `slimer new <name>`
- Run `slimer --help` for full usage details

## Develop

This is a mono repository, managed with [lerna](https://lernajs.io/). 

1. `git clone` this repo & `cd` into it as usual
2. `yarn setup` is mapped to `lerna bootstrap`
   - installs all external dependencies 
   - links all interal dependencies

## Run

- `yarn dev` is an alias for `slimer`

## Test
- `yarn lint` run just eslint
- `yarn test` run tests & then eslint

## Publish

- `yarn ship` is mapped to `lerna publish` and will publish any package that has changed.

# Copyright & License

Copyright (c) 2018 Ghost Foundation - Released under the [MIT license](LICENSE).
