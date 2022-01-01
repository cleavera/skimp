export interface IEntity {
    exists(): Promise<boolean>;
    readContent(): Promise<string>;
    createdDate(): Promise<Date>;
    listChildren(): Promise<Array<string>>;
    delete(): Promise<void>;
    write(content: string): Promise<void>;
}
