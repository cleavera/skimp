import { Field, Relationship, Schema } from '../../src/schema';
import { Required, String } from '../../src/validation';
import { PersonSchema } from './person';

@Schema('team')
@Relationship(PersonSchema)
export class TeamSchema {
    @Field()
    @String
    @Required
    public name: string;
}
