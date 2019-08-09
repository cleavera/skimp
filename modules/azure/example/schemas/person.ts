import { Field, Schema } from '@skimp/schema';
import { BooleanType, DateType, IntegerType, NumberType, Required, StringType } from '@skimp/validation';

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
    @Field()
    public gender!: string;
}
