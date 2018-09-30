#!/usr/bin/env node
const prettyCLI = require('@tryghost/pretty-cli');
const slimer = require('@tryghost/slimer');

slimer
    .loadCommands()
    .then((commands) => {
        commands.forEach((command) => {
            prettyCLI.command(command);
        });

        prettyCLI.parseAndExit();
    });
