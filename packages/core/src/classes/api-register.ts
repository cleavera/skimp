import { isNull, isUndefined } from '@cleavera/utils';

import { ContentTypeNotSupportedException } from '../exceptions/content-type-not-supported.exception';
import { NoContentTypesConfiguredException } from '../exceptions/no-content-types-configured.exception';
import { IApi } from '../interfaces/api.interface';

export class ApiRegister {
    public defaultContentType: string | null;

    private readonly _apis: Record<string, IApi>;

    constructor() {
        this._apis = {};
        this.defaultContentType = null;
    }

    public configure(db: IApi, contentType: string): void {
        if (isNull(this.defaultContentType)) {
            this.defaultContentType = contentType;
        }

        this._apis[contentType] = db;
    }

    public get(contentType: string | null = null): IApi {
        if (isNull(contentType)) {
            if (isNull(this.defaultContentType)) {
                throw new NoContentTypesConfiguredException();
            }

            contentType = this.defaultContentType;
        }

        if (isNull(this._apis[contentType]) || isUndefined(this._apis[contentType])) {
            throw new ContentTypeNotSupportedException(contentType);
        }

        return this._apis[contentType];
    }
}
