import 'mocha';
import * as assert from 'assert';

import Config from '../../scripts/utility/config';
import ConfigTestUtility from '../utility/config';
import WichtelEventPhase from '../../scripts/utility/wichtelEvent';

describe('config',
    function ()
    {
        afterEach(
            function ()
            {
                ConfigTestUtility.resetConfig();
            }
        );

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

        it('currentEventPhase is Waiting',
            function ()
            {
                ConfigTestUtility.setToWaitingPhase();

                const givenEventPhase = Config.currentEventPhase;
                const expectedEventPhase = WichtelEventPhase.Waiting;

                assert.strictEqual(givenEventPhase, expectedEventPhase);
            }
        );

        it('currentEventPhase is Registration',
            function ()
            {
                ConfigTestUtility.setToRegistrationPhase();

                const givenEventPhase = Config.currentEventPhase;
                const expectedEventPhase = WichtelEventPhase.Registration;

                assert.strictEqual(givenEventPhase, expectedEventPhase);
            }
        );

        it('currentEventPhase is Wichteln',
            function ()
            {
                ConfigTestUtility.setToWichtelnPhase();

                const givenEventPhase = Config.currentEventPhase;
                const expectedEventPhase = WichtelEventPhase.Wichteln;

                assert.strictEqual(givenEventPhase, expectedEventPhase);
            }
        );

        it('currentEventPhase is End',
            function ()
            {
                ConfigTestUtility.setToEndPhase();

                const givenEventPhase = Config.currentEventPhase;
                const expectedEventPhase = WichtelEventPhase.Ended;

                assert.strictEqual(givenEventPhase, expectedEventPhase);
            }
        );
    }
);
