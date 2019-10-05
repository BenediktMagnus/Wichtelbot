import 'mocha';
import { equal } from 'assert';

describe('Mocha', // The space is there for this test to be alphabetically sorted at the top.
    () => {
        it('is working.',
            () => {
                equal(true, true);
            }
        );
    }
);
