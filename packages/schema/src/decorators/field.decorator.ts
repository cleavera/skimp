import { isNull, isSymbol } from '@cleavera/utils';

import { SCHEMA_REGISTER } from '../constants/schema-register.constant';
import { FieldCannotBeSymbolException } from '../exceptions/field-cannot-be-symbol.exception';

export function Field(alias: string | null = null): PropertyDecorator {
    return (target: any, propertyKey: string | symbol): void => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (isSymbol(propertyKey)) {
            throw new FieldCannotBeSymbolException(propertyKey);
        }

        if (isNull(alias)) {
            alias = propertyKey;
        }

        SCHEMA_REGISTER.addFieldMapping(target.constructor, propertyKey, alias);
    };
}
