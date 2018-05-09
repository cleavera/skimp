import uuid = require('uuid');
import { IMeta } from '../interfaces/meta.interface';
import { Nullable } from '../interfaces/nullable.interface';

export class MetaData implements IMeta {
    private readonly _objects: { [key: string]: any }; // tslint:disable-line no-any
    private readonly  _metaData: { [key: string]: { [metaDataKey: string]: any }}; // tslint:disable-line no-any

    constructor() {
        this._objects = {};
        this._metaData = {};
    }

    public set(object: any, metaKey: string, value: any): void { // tslint:disable-line no-any
        const objectId: string = this._getObjectId(object);

        if (!this._metaData[objectId]) {
            this._metaData[objectId] = {};
        }

        this._metaData[objectId][metaKey] = value;
    }

    public get<T = any>(object: any, metaKey: string): Nullable<T> { // tslint:disable-line no-any
        const objectId: string = this._getObjectId(object);

        if (!this._metaData[objectId]) {
            this._metaData[objectId] = {};
        }

        return this._metaData[objectId][metaKey];
    }

    private _getObjectId(object: any): string { // tslint:disable-line no-any
        for (const objectId in this._objects) {
            if (this._objects[objectId] === object) {
                return objectId;
            }
        }

        const newObjectId: string = uuid.v4();

        this._objects[newObjectId] = object;

        return newObjectId;
    }
}
