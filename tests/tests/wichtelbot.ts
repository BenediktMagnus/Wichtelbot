import 'mocha';

import Wichtelbot from '../../scripts/wichtelbot';

describe('wichtelbot',
    function ()
    {
        let wichtelbot: Wichtelbot;

        it('can be instantiated.',
            function (done)
            {
                wichtelbot = new Wichtelbot(
                    (): void => done(),
                    true
                );
            }
        );

        it('can be terminated.',
            function ()
            {
                wichtelbot.terminate();
            }
        );
    }
);
