import { Field, Relationship, Schema } from '@skimp/schema';
import { Required, String } from '@skimp/validation';
import { PersonSchema } from './person';

@Schema('job')
@Relationship(PersonSchema, 1)
export class JobSchema {
    @Field()
    @String
    @Required
    public name: string;
}
