import { Field, Required, Schema } from '../../src';

@Schema('person')
export class PersonSchema {
    @Required
    @Field('fullName')
    public name: string;

    @Field('dateOfBirth')
    public dateOfBirth: Date;

    @Field('height')
    public height: number;

    @Field('weight')
    public weight: number;
}
