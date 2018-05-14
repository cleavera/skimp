import { Field, Required, Schema, String } from '../../src';
import { Relationship } from '../../src/schema';
import { PersonSchema } from './person';

@Schema('team')
@Relationship(PersonSchema)
export class TeamSchema {
    @Field()
    @String
    @Required
    public name: string;
}
