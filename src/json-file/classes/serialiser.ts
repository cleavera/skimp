import {
    IFieldMapping,
    ISchema, ResourceNotRegisteredException,
    SCHEMA_REGISTER,
    SchemaHasNoFieldsException,
    SchemaNotRegisteredException
} from '../../schema';
import { ISerialisationResult } from '../../serialiser';
import { IData } from '../interfaces/data.interface';
import { IJsonFile } from '../interfaces/json-file.interface';

export class Serialiser {
    public serialise(model: any): string { // tslint:disable-line no-any
        const schema: ISchema = model.constructor;
        const fields: Array<IFieldMapping> | void = SCHEMA_REGISTER.getFields(schema);
        const type: string | void = SCHEMA_REGISTER.getSchemaResourceName(schema);

        if (!type) {
            throw new SchemaNotRegisteredException(schema);
        }

        if (!fields || !fields.length) {
            throw new SchemaHasNoFieldsException(schema);
        }

        const out: IJsonFile = {
            type,
            data: fields.reduce((result: IData, field: IFieldMapping): IData => {
                result[field.fieldName] = model[field.propertyName];

                return result;
            }, {})
        };

        return JSON.stringify(out, null, '\t');
    }

    public deserialise(body: string): ISerialisationResult {
        const json: IJsonFile = JSON.parse(body);
        const schema: ISchema | void = SCHEMA_REGISTER.getSchema(json.type);

        if (!schema) {
            throw new ResourceNotRegisteredException(json.type);
        }

        const fields: Array<IFieldMapping> | void = SCHEMA_REGISTER.getFields(schema);

        if (!fields || !fields.length) {
            throw new SchemaHasNoFieldsException(schema);
        }

        const model: any = new schema(); // tslint:disable-line no-any

        fields.forEach((field: IFieldMapping) => {
            model[field.propertyName] = json.data[field.fieldName];
        });

        return model;
    }
}
