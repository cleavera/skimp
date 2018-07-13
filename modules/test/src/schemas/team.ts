import { Field, Relationship, Schema } from '@skimp/schema';
import { Required, String } from '@skimp/validation';
import { PersonSchema } from './person';

@Schema('team')
@Relationship(PersonSchema)
export class TeamSchema {
    @Field()
    @String
    @Required
    public name: string;
}
