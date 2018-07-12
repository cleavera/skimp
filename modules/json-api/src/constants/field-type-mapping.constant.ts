import { FieldType } from '../../../schema/src/index';

export const FieldTypeMapping: { [type: string]: 'number' | 'string' | 'boolean' } = {
    [FieldType.INTEGER]: 'number',
    [FieldType.NUMBER]: 'number',
    [FieldType.STRING]: 'string',
    [FieldType.DATE]: 'string',
    [FieldType.BOOLEAN]: 'boolean'
};
