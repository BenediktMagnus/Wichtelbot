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

        it('reload',
            function ()
            {
                const oldLocale = Config.main.locale;
                Config.main.locale = Config.main.locale + 'test';

                const oldBotName = Config.bot.name;
                Config.bot.name = Config.bot.name + 'test';

                Config.reload();

                assert.strictEqual(Config.main.locale, oldLocale);
                assert.strictEqual(Config.bot.name, oldBotName);
            }
        );
    }
);
