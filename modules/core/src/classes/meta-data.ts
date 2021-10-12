import { isNull, isUndefined } from '@cleavera/utils';
import { v4 as uuid } from 'uuid';

import { IMeta } from '../interfaces/meta.interface';

export class MetaData implements IMeta {
    private readonly _objects: Record<string, unknown>;
    private readonly _metaData: Record<string, Record<string, unknown>>;

    constructor() {
        this._objects = {};
        this._metaData = {};
    }

    public set(object: unknown, metaKey: string, value: unknown): void {
        const objectId: string = this._getObjectId(object);

        if (isNull(this._metaData[objectId]) || isUndefined(this._metaData[objectId])) {
            this._metaData[objectId] = {};
        }

        this._metaData[objectId][metaKey] = value;
    }

    public get<T = unknown>(object: unknown, metaKey: string): T | null {
        const objectId: string = this._getObjectId(object);

        if (isNull(this._metaData[objectId]) || isUndefined(this._metaData[objectId])) {
            this._metaData[objectId] = {};
        }

        return this._metaData[objectId][metaKey] as T ?? null;
    }

    private _getObjectId(object: unknown): string {
        for (const objectId in this._objects) {
            if (this._objects[objectId] === object) {
                return objectId;
            }
        }

        const newObjectId: string = uuid();

        this._objects[newObjectId] = object;

        return newObjectId;
    }
}
