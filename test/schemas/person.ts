import { Boolean, Date, Field, Integer, Number, Options, Required, Schema, String } from '../../src';
import { GENDER_OPTIONS } from '../constants/gender-options.constant';

@Schema('person')
export class PersonSchema {
    @Required
    @String
    @Field('fullName')
    public name: string;

    @Date
    @Field()
    public dateOfBirth: Date;

    @Number
    @Field()
    public height: number;

    @Integer
    @Field()
    public weight: number;

    @Boolean
    @Field()
    public employed: boolean;

    @String
    @Options(GENDER_OPTIONS)
    @Field()
    public gender: string;
}
