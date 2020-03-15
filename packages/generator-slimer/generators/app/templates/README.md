# <%= projectName %>

## Install
<% if (type === 'module' || type === 'pkg')  { -%>

`npm install <%= npmName %> --save`

or

`yarn add <%= npmName %>`
<% } -%>


## Usage


## Develop

<% if (type === 'pkg') { -%>
This is a mono repository, managed with [lerna](https://lernajs.io/).

Follow the instructions for the top-level repo.
<% } if (type === 'mono') { -%>
This is a mono repository, managed with [lerna](https://lernajs.io/).

1. `git clone` this repo & `cd` into it as usual
2. `yarn setup` is mapped to `lerna bootstrap`
   - installs all external dependencies
   - links all internal dependencies

To add a new package to the repo:
   - install [slimer](https://github.com/TryGhost/slimer)
   - run `slimer new <package name>`
<% } else { -%>
1. `git clone` this repo & `cd` into it as usual
2. Run `yarn` to install top-level dependencies.
<% } %>

## Run

- `yarn dev`
<% if (type === 'app') { -%>
- View: [http://localhost:9999](http://localhost:9999)
<% } -%>


## Test

- `yarn lint` run just eslint
- `yarn test` run lint and tests


<% if (type !== 'pkg') { -%>
## Publish

<% if (type === 'mono') { -%>
- `yarn ship` is an alias for `lerna publish`
    - Publishes all packages which have changed
    - Also updates any packages which depend on changed packages
<% } else { -%>
- `yarn ship`
<% } -%>
<% } -%>
