# Generator Slimer

`generator-slimer` is a yeoman generator, but isn't intended to be used standalone, 
instead it's part of the [slimer](https://github.com/TryGhost/slimer) toolset.

## Install

- `npm i -g @tryghost/slimer-cli`

## Develop

This is a mono repository, managed with [lerna](https://lernajs.io/). 

1. Clone & setup the top level repo
2. `cd` into this package 
3. Run `yarn link` to make the generator available 

## Run
- Use: `yarn dev <name>` which is mapped to `yo slimer <name>`

## Test
- `yarn lint` run just eslint
- `yarn test` run lint && tests

# Copyright & License

Copyright (c) 2018 Ghost Foundation - Released under the [MIT license](LICENSE).
