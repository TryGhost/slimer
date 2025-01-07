# Slimer

The `slimer` CLI tool automates common tasks when working on Ghost and in the surrounding ecosystem.

## Install

Add me to your globals:

- `npm install --global @tryghost/slimer-cli`


## Usage

I aim to be easy to use, if you ever get stuck, try adding `--help` to a command.

- Run `slimer` or `slimer --help` for full usage details
- Try `slimer new --help` for information on how to create new projects
- Try `slimer fix --help` to see common maintenance tasks


## Develop

This is a mono repository, managed with [lerna](https://lernajs.io/).

1. `git clone` this repo & `cd` into it as usual
2. `yarn setup` is mapped to `lerna bootstrap`
   - installs all external dependencies
   - links all internal dependencies

To add a new package to the repo:
   - install me!
   - run `slimer new <package name>`


## Run

- `yarn dev` (or `yarn slimer`) are aliases for `slimer`
- `yarn link:cli` will make your local dev version available globally as just `slimer <command>`
- `yarn unlink:cli` will remove it again

**Note**: normally `yarn link` would work for this, but it's not working with the lerna repo for me.


## Test

- `yarn lint` run just eslint
- `yarn test` run tests & then eslint


## Publish

- `yarn ship` is an alias for `lerna publish`
    - Publishes all packages which have changed
    - Also updates any packages which depend on changed packages


# Copyright & License

Copyright (c) 2013-2025 Ghost Foundation - Released under the [MIT license](LICENSE).
