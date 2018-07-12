import { Field, Relationship, Schema } from '../../modules/schema';
import { Required, String } from '../../modules/validation';
import { PersonSchema } from './person';

@Schema('team')
@Relationship(PersonSchema)
export class TeamSchema {
    @Field()
    @String
    @Required
    public name: string;
}
