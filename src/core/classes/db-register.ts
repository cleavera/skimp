import { DbNotConfiguredException } from '../exceptions/db-not-configured.exception';
import { IDb } from '../interfaces/db.interface';

export class DbRegister {
    private _db: IDb;

    public configure(db: IDb): void {
        this._db = db;
    }

    public get(): IDb {
        if (!this._db) {
            throw new DbNotConfiguredException();
        }

        return this._db;
    }
}
