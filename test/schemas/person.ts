import { Field, Schema } from '../../src';

@Schema('person')
export class PersonSchema {
    @Field('fullName')
    public name: string;
}
