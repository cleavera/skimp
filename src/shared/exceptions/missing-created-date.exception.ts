import { CREATED } from '../constants/meta-field-names.constant';
import { MissingMetaDataException } from './missing-meta-data.exception';

export class MissingCreatedDateException extends MissingMetaDataException {
    constructor(model: any) {
        super(model, CREATED);
    }
}
