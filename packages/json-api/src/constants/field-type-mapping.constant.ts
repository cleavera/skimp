import { IDict } from '@cleavera/utils';
import { FieldType } from '@skimp/schema';

export const FieldTypeMapping: IDict<'number' | 'string' | 'boolean'> = {
    [FieldType.INTEGER]: 'number',
    [FieldType.NUMBER]: 'number',
    [FieldType.STRING]: 'string',
    [FieldType.DATE]: 'string',
    [FieldType.BOOLEAN]: 'boolean'
};
