import 'mocha';

import Wichtelbot from '../../scripts/wichtelbot';

describe('wichtelbot',
    function ()
    {
        let wichtelbot: Wichtelbot;

        it('can be instantiated and terminated.',
            function ()
            {
                wichtelbot = new Wichtelbot(true);

                wichtelbot.terminate();
            }
        );

        it('can login and be terminated.',
            async function ()
            {
                wichtelbot = new Wichtelbot(true);

                await wichtelbot.login();

                wichtelbot.terminate();
            }
        );
    }
);
