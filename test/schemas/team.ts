import { Field, Relationship, Schema } from '../../modules/schema/src/index';
import { Required, String } from '../../modules/validation/src/index';
import { PersonSchema } from './person';

@Schema('team')
@Relationship(PersonSchema)
export class TeamSchema {
    @Field()
    @String
    @Required
    public name: string;
}
