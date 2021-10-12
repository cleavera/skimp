#!/usr/bin/env node

import glob from 'glob';
import { promises as fs } from 'fs';

const map = {};

glob('./modules/*/package.json', { cwd: process.cwd() }, async(error, files) => {
    if (error !== null) {
        throw error;
    }

    for (const file of files) {
        const { name, peerDependencies } = JSON.parse(await fs.readFile(file, {encoding: 'utf-8'}));

        let dependencies = [];

        if (peerDependencies) {
            dependencies = dependencies.concat(Object.keys(peerDependencies));
        }

        const pkg = getPackage(name);

        pkg.dependencies = dependencies;

        dependencies.forEach((dep) => {
            getPackage(dep).dependants.push(name);
        });
    }

    console.log(map);
});

function getPackage(name) {
    if (!(name in map)) {
        map[name] = {
            dependencies: [],
            dependants: []
        };
    }

    return map[name];
}
