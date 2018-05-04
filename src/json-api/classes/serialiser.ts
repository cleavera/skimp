import { IFieldMapping, ISchema, ResourceNotRegisteredException, SCHEMA_REGISTER, SchemaHasNoFieldsException, SchemaNotRegisteredException } from '../../schema';
import { ISerialisationResult } from '../../serialiser';
import { Url } from '../../server';
import { IAttributes } from '../interfaces/attributes.interface';
import { IJsonApi } from '../interfaces/json-api.interface';

export class Serialiser {
    public serialise(model: any, location: Url): IJsonApi { // tslint:disable-line no-any
        const schema: ISchema = model.constructor;
        const fields: Array<IFieldMapping> | void = SCHEMA_REGISTER.getFields(schema);
        const type: string | void = SCHEMA_REGISTER.getSchemaResourceName(schema);

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

    public deserialise(json: IJsonApi): ISerialisationResult {
        const schema: ISchema | void = SCHEMA_REGISTER.getSchema(json.data.type);

        if (!schema) {
            throw new ResourceNotRegisteredException(json.data.type);
        }

        const fields: Array<IFieldMapping> | void = SCHEMA_REGISTER.getFields(schema);

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
