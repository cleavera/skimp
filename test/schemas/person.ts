import { Field, Required, Schema, String } from '../../src';

@Schema('person')
export class PersonSchema {
    @Required
    @String
    @Field('fullName')
    public name: string;

    @Field('dateOfBirth')
    public dateOfBirth: Date;

    @Field('height')
    public height: number;

    @Field('weight')
    public weight: number;
}
