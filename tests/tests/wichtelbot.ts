import 'mocha';

import Wichtelbot from '../../scripts/wichtelbot';

describe('wichtelbot',
    function ()
    {
        let wichtelbot: Wichtelbot;

        it('can be instantiated and terminated.',
            function (done)
            {
                const onStarted = (): void =>
                {
                    wichtelbot.terminate();
                    done();
                };

                wichtelbot = new Wichtelbot(onStarted, true);
            }
        );
    }
);
