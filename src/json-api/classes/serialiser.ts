import { Location, ValidationException } from '../../router';
import {
    IFieldMapping,
    ISchema,
    ModelPointer,
    ModelValidationException,
    ResourceNotRegisteredException,
    SCHEMA_REGISTER,
    SchemaHasNoFieldsException,
    SchemaNotRegisteredException
} from '../../schema';
import { Nullable } from '../../shared';
import { IAttributes } from '../interfaces/attributes.interface';
import { IJsonData } from '../interfaces/json-data.interface';
import { IJsonError } from '../interfaces/json-error.interface';
import { IJsonErrors } from '../interfaces/json-errors.interface';

export class Serialiser {
    public error(errors: Array<ValidationException>): IJsonErrors {
        return {
            errors: errors.reduce((acc: Array<IJsonError>, exception: ValidationException) => {
                const fields: Array<ModelPointer> = (exception as ModelValidationException).fields || [null];

                return acc.concat((fields).map((pointer: ModelPointer): IJsonError => {
                    return {
                        code: exception.code,
                        source: {
                            pointer: pointer ? `/data/attributes/${pointer.field}` : ''
                        }
                    };
                }));
            }, [])
        };
    }

    public serialise(model: any, location: Location): IJsonData {
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
                    result[field.fieldName] = SCHEMA_REGISTER.serialise(schema, field.propertyName, model[field.propertyName]);

                    return result;
                }, {})
            }
        };
    }

    public deserialise(json: IJsonData): any {
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
            model[field.propertyName] = SCHEMA_REGISTER.deserialise(schema, field.propertyName, json.data.attributes[field.fieldName]);
        });

        return model;
    }
}
