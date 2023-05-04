module.exports = {<% if (isTypescript) { %>
    parser: '@typescript-eslint/parser',<% } %>
    plugins: ['ghost'],
    extends: [
        'plugin:ghost/test'
    ]
};
