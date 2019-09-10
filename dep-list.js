#!/usr/bin/env node

import { $readFile } from '@cleavera/fs';
import { $isNull, IDict, Maybe } from '@cleavera/utils';
import * as glob from 'glob';

const map: any = {};

glob('./modules/*/package.json', { cwd: process.cwd() }, async(error: Maybe<Error>, files: Array<string>) => {
    if (!$isNull(error)) {
        throw error;
    }

    for (const file of files) {
        const { name, peerDependencies }: { name: string, peerDependencies: IDict<string>} = JSON.parse(await $readFile(file));

        let dependencies: Array<string> = [];

        if (peerDependencies) {
            dependencies = dependencies.concat(Object.keys(peerDependencies));
        }

        const pkg: any = getPackage(name);

        pkg.dependencies = dependencies;

        dependencies.forEach((dep: string) => {
            getPackage(dep).dependants.push(name);
        });
    }

    console.log(map);
});

function getPackage(name: string): any {
    if (!(name in map)) {
        map[name] = {
            dependencies: [],
            dependants: []
        };
    }

    return map[name];
}
