import { ResourceLocation } from '@skimp/core';
import { IEntityFactory } from '@skimp/json-file';
import { join, parse, ParsedPath, sep } from 'path';
import { Entity } from './entity';

export class EntityFactory implements IEntityFactory {
    public basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    public fromPath(path: string): Promise<Entity> {
        return Entity.fromPath(this.getAbsolutePath(path));
    }

    public parseResourceLocation(path: string): ResourceLocation {
        const parsedPath: ParsedPath = parse(path);
        const resource: string = parsedPath.dir.substring(parsedPath.dir.lastIndexOf(sep) + 1);

        return new ResourceLocation(resource, parsedPath.name);
    }

    private getAbsolutePath(path: string): string {
        if (path.indexOf(this.basePath) > -1) {
            return path;
        }

        return join(this.basePath, path);
    }
}
