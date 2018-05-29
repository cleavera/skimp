import { Entity } from '../../src/file-system';
import { SCHEMA_REGISTER } from '../../src/schema';

export async function $clearDB(): Promise<void> {
    let files: Array<string> = [];

    for (const schema of SCHEMA_REGISTER.schemas) {
        files = files.concat(await (await Entity.fromPath(`/${SCHEMA_REGISTER.getSchemaResourceName(schema)}`)).listChildren());
    }

    await Promise.all(files.map(async(file: string) => {
        await (await Entity.fromPath(file)).delete();
    }));
}
