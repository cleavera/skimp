import { $isNull, $isSymbol, Maybe } from '@cleavera/utils';

import { SCHEMA_REGISTER } from '../constants/schema-register.constant';
import { FieldCannotBeSymbolException } from '../exceptions/field-cannot-be-symbol.exception';

export function Field(alias: Maybe<string> = null): PropertyDecorator {
    return (target: any, propertyKey: string | symbol): void => { // eslint-disable-line
        if ($isSymbol(propertyKey)) {
            throw new FieldCannotBeSymbolException(propertyKey);
        }

        if ($isNull(alias)) {
            alias = propertyKey;
        }

        SCHEMA_REGISTER.addFieldMapping(target.constructor, propertyKey, alias);
    };
}
