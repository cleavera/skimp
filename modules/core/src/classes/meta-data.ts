import { $isNull, $isUndefined, Maybe } from '@skimp/shared';
import { v4 as uuid } from 'uuid';

import { IMeta } from '../interfaces/meta.interface';

export class MetaData implements IMeta {
    private readonly _objects: { [key: string]: any }; // tslint:disable-line no-any
    private readonly  _metaData: { [key: string]: { [metaDataKey: string]: any }}; // tslint:disable-line no-any

    constructor() {
        this._objects = {};
        this._metaData = {};
    }

    public set(object: any, metaKey: string, value: any): void { // tslint:disable-line no-any
        const objectId: string = this._getObjectId(object);

        if ($isNull(this._metaData[objectId]) || $isUndefined(this._metaData[objectId])) {
            this._metaData[objectId] = {};
        }

        this._metaData[objectId][metaKey] = value;
    }

    public get<T = any>(object: any, metaKey: string): Maybe<T> { // tslint:disable-line no-any
        const objectId: string = this._getObjectId(object);

        if ($isNull(this._metaData[objectId]) || $isUndefined(this._metaData[objectId])) {
            this._metaData[objectId] = {};
        }

        return this._metaData[objectId][metaKey] || null;
    }

    private _getObjectId(object: any): string { // tslint:disable-line no-any
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
