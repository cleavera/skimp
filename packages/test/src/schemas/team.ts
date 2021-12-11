import { Field, Relationship, Schema } from '@skimp/schema';
import { Required, StringType } from '@skimp/validation';

import { PersonSchema } from './person';

@Schema('team')
@Relationship(PersonSchema)
export class TeamSchema {
    @Field()
    @StringType
    @Required
    public name!: string;
}
