import 'mocha';
import * as assert from 'assert';

import Config from '../../scripts/utility/config';

describe('config',
    function ()
    {
        it('has working main config.',
            function ()
            {
                assert.notStrictEqual(Config.main.currentEvent.name, undefined);
            }
        );

        it('has working bot config.',
            function ()
            {
                assert.notStrictEqual(Config.bot.name, undefined);
            }
        );
    }
);
