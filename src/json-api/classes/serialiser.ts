import { Location } from '../../router';
import { IFieldMapping, ISchema, ResourceNotRegisteredException, SCHEMA_REGISTER, SchemaHasNoFieldsException, SchemaNotRegisteredException } from '../../schema';
import { Nullable } from '../../shared';
import { IAttributes } from '../interfaces/attributes.interface';
import { IJsonApi } from '../interfaces/json-api.interface';

export class Serialiser {
    public serialise(model: any, location: Location): IJsonApi {
        const schema: ISchema = model.constructor;
        const fields: Nullable<Array<IFieldMapping>> = SCHEMA_REGISTER.getFields(schema);
        const type: Nullable<string> = SCHEMA_REGISTER.getSchemaResourceName(schema);

        if (!type) {
            throw new SchemaNotRegisteredException(schema);
        }

        if (!fields || !fields.length) {
            throw new SchemaHasNoFieldsException(schema);
        }

        return {
            data: {
                type,
                id: location.toString(),
                attributes: fields.reduce((result: IAttributes, field: IFieldMapping): IAttributes => {
                    result[field.fieldName] = model[field.propertyName];

                    return result;
                }, {})
            }
        };
    }

    public deserialise(json: IJsonApi): any {
        const schema: Nullable<ISchema> = SCHEMA_REGISTER.getSchema(json.data.type);

        if (!schema) {
            throw new ResourceNotRegisteredException(json.data.type);
        }

        const fields: Nullable<Array<IFieldMapping>> = SCHEMA_REGISTER.getFields(schema);

        if (!fields || !fields.length) {
            throw new SchemaHasNoFieldsException(schema);
        }

        const model: any = new schema(); // tslint:disable-line no-any

        fields.forEach((field: IFieldMapping) => {
            model[field.propertyName] = json.data.attributes[field.fieldName];
        });

        return model;
    }
}
