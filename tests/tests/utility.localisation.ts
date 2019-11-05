import 'mocha';
import { assert } from 'chai';

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
                assert.notStrictEqual(Localisation.texts.notUnderstood.rawString.length, undefined);
            }
        );
    }
);
