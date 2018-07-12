import { IOptions } from '../../modules/schema';
import { Gender } from './genders.constant';

export const GENDER_OPTIONS: IOptions<string> = [
    Gender.FEMALE,
    Gender.MALE
];
