import { Field, Schema } from '../../../schema';

@Schema('person')
export class PersonSchema {
    @Field('fullName')
    public name: string;
}
