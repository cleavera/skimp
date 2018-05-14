import { Field, Required, Schema, String } from '../../src';
import { Relationship } from '../../src/schema';
import { PersonSchema } from './person';

@Schema('job')
@Relationship(PersonSchema, 1)
export class JobSchema {
    @Field()
    @String
    @Required
    public name: string;
}
