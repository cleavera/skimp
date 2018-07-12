import { init } from '../src/index';
import * as DATA_PATH from './data/path';
import { PersonSchema } from './schemas/person';

init(1337, DATA_PATH, [PersonSchema]);
