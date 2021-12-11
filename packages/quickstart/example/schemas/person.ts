import { Field, Schema } from '@skimp/schema';
import { BooleanType, DateType, IntegerType, NumberType, Options, Required, StringType } from '@skimp/validation';

import { GENDER_OPTIONS } from '../constants/gender-options.constant';

@Schema('person')
export class PersonSchema {
    @Required
    @StringType
    @Field('fullName')
    public name!: string;

    @DateType
    @Field()
    public dateOfBirth!: Date;

    @NumberType
    @Field()
    public height!: number;

    @IntegerType
    @Field()
    public weight!: number;

    @BooleanType
    @Field()
    public employed!: boolean;

    @StringType
    @Options(GENDER_OPTIONS)
    @Field()
    public gender!: string;
}
