import { Field, Schema } from '../../../schema/src/index';

@Schema('person')
export class PersonSchema {
    @Field('fullName')
    public name: string;
}