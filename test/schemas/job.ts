
import { Field, Relationship, Schema } from '../../src/schema';
import { Required, String } from '../../src/validation';
import { PersonSchema } from './person';

@Schema('job')
@Relationship(PersonSchema, 1)
export class JobSchema {
    @Field()
    @String
    @Required
    public name: string;
}
