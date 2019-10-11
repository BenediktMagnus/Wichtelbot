import 'mocha';
import * as assert from 'assert';

import Localisation from '../../scripts/utility/localisation';

describe('localisation',
    function ()
    {
        it('has working commands.',
            function ()
            {
                assert.notStrictEqual(Localisation.commands.contacting.commands.length, undefined);
            }
        );

        it('has working texts.',
            function ()
            {
                assert.notStrictEqual(Localisation.texts.contacting.rawString.length, undefined);
            }
        );
    }
);
