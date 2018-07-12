
import { Field, Relationship, Schema } from '../../modules/schema';
import { Required, String } from '../../modules/validation';
import { PersonSchema } from './person';

@Schema('job')
@Relationship(PersonSchema, 1)
export class JobSchema {
    @Field()
    @String
    @Required
    public name: string;
}
