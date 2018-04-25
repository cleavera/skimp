import { Field, Schema } from '../../.dist';

@Schema('person')
export class PersonSchema {
    @Field('fullName')
    public name: string;
}
