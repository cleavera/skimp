import { Field, Relationship, Schema } from '@skimp/schema';
import { Required, StringType } from '@skimp/validation';

import { PersonSchema } from './person';

@Schema('job')
@Relationship(PersonSchema, 1)
export class JobSchema {
    @Field()
    @StringType
    @Required
    public name!: string;
}
