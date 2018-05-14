import { Nullable } from '../../shared';
import { ISchema } from './schema.interface';

export interface IRelationshipDefinition {
    schema: ISchema;
    limit: Nullable<number>;
}
