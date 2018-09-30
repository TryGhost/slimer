# <%= projectName %>

## Install
<% if (type === 'module' || type === 'pkg')  { %>
`npm install <%= npmName %> --save`

or

`yarn add <%= npmName %>`
<% } %>

## Usage


## Develop

<% if (type === 'pkg') { %>
This is a mono repository, managed with [lerna](https://lernajs.io/).

Follow the instructions for the top-level repo.
<% } else { %>
1. `git clone` this repo & `cd` into it as usual
2. Run `yarn` to install top-level dependencies.
<% } %>

## Run
- `yarn dev`
<% if (type === 'app') { %>
- View: [http://localhost:9999](http://localhost:9999)
<% } %>

## Test
- `yarn lint` run just eslint
- `yarn test` run lint and tests

<% if (type !== 'pkg') { %>
## Publish

- `yarn ship`
<% } %>

# Copyright & License

<%- copyright %>
