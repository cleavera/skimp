import { Date, Field, Integer, Number, Required, Schema, String } from '../../src';

@Schema('person')
export class PersonSchema {
    @Required
    @String
    @Field('fullName')
    public name: string;

    @Date
    @Field('dateOfBirth')
    public dateOfBirth: Date;

    @Number
    @Field('height')
    public height: number;

    @Integer
    @Field('weight')
    public weight: number;
}
