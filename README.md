# Slimer

A suite of tools for working on Ghost and in the surrounding ecosystem.

It (will soon) provide a CLI tool for quickly starting new projects.

Slimer is capable of creating 4 different types of project:

- **Pkg:**    create a package inside a mono repo
- **Mono:**   start a new mono repo with lerna, just like the `slimer` repo
- **Module:** a simple standalone node module
- **App:**    a standalone app, based on express

## Install

Add me to your globals:

- `npm i -g @tryghost/slimer-cli`


## Usage

I aim to be easy to use, if you ever get stuck, try adding `--help` to a command.

- `slimer new <name>`
- Run `slimer` or `slimer --help` for full usage details


## Develop

This is a mono repository, managed with [lerna](https://lernajs.io/).

1. `git clone` this repo & `cd` into it as usual
2. `yarn setup` is mapped to `lerna bootstrap`
   - installs all external dependencies
   - links all internal dependencies


## Run

- `yarn dev` (or `yarn slimer`) are aliases for `slimer`
- `yarn link:cli` will make your local dev version available globally as just `slimer <command>`
- `yarn unlink:cli` will remove it again


**Note**: normally `yarn link` would work for this, but it's not working with the lerna repo for me.


## Test

- `yarn lint` run just eslint
- `yarn test` run tests & then eslint

## Publish

- `yarn ship` is mapped to `lerna publish` and will publish any package that has changed.

# Copyright & License

Copyright (c) 2018 Ghost Foundation - Released under the [MIT license](LICENSE).
