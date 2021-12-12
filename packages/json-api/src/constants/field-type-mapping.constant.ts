import { FieldType } from '@skimp/schema';

export const FieldTypeMapping: Record<string, 'number' | 'string' | 'boolean'> = {
    [FieldType.INTEGER]: 'number',
    [FieldType.NUMBER]: 'number',
    [FieldType.STRING]: 'string',
    [FieldType.DATE]: 'string',
    [FieldType.BOOLEAN]: 'boolean'
};
