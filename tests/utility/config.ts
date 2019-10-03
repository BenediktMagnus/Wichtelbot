import 'mocha';
import * as assert from 'assert';

import Config from '../../scripts/utility/config';

describe('Config',
    function ()
    {
        it('can be loaded.',
            () => {
                assert.doesNotThrow(() => Config.load());
            }
        );

        it('has working main config.',
            () => {
                assert.notStrictEqual(Config.main.wichtelEvents.length, undefined);
            }
        );

        it('has working bot config.',
            () => {
                assert.notStrictEqual(Config.bot.name, undefined);
            }
        );
    }
);
