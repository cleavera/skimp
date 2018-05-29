import { ContentTypeNotSupportedException } from '../exceptions/content-type-not-supported.exception';
import { IApi } from '../interfaces/api.interface';

export class ApiRegister {
    public defaultContentType: string;

    private readonly _apis: { [contentType: string]: IApi };

    constructor() {
        this._apis = {};
    }

    public configure(db: IApi, contentType: string): void {
        if (!this.defaultContentType) {
            this.defaultContentType = contentType;
        }

        this._apis[contentType] = db;
    }

    public get(contentType: string = this.defaultContentType): IApi {
        if (!this._apis[contentType]) {
            throw new ContentTypeNotSupportedException(contentType);
        }

        return this._apis[contentType];
    }
}
