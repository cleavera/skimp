import { Field, Schema } from '@skimp/schema';

@Schema('person')
export class PersonSchema {
    @Field('fullName')
    public name: string;
}
