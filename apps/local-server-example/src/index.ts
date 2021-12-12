import { init } from '@skimp/quickstart';
import DATA_PATH from './data/path';
import { PersonSchema } from './schemas/person';

init(1337, DATA_PATH, [PersonSchema]).catch((e: Error) => {
    throw e;
});
