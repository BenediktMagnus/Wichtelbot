import 'mocha';
import * as assert from 'assert';

import Utils from '../../scripts/utility/utils';

describe('utils',
    function ()
    {
        it('splitTextNaturally breaks after whitespace.',
            function ()
            {
                const text = 'first second\nthird';
                const expected = [
                    'first',
                    'second',
                    'third',
                ];
                const result = Utils.splitTextNaturally(text, expected[0].length + 1);

                assert.deepStrictEqual(result, expected);
            }
        );

        it('splitTextNaturally works with too long words.',
            function ()
            {
                const text = 'first secondistoolong end';
                const expected = [
                    'first second',
                    'istoolong',
                    'end',
                ];
                const result = Utils.splitTextNaturally(text, 12, 5);

                assert.deepStrictEqual(result, expected);
            }
        );

        it('splitTextNaturally works with too long blocks.',
            function ()
            {
                const text = 'thisistoolong end';
                const expected = [
                    'thisisto',
                    'olong',
                    'end',
                ];
                const result = Utils.splitTextNaturally(text, 8);

                assert.deepStrictEqual(result, expected);
            }
        );

        /*
            5. Trim
            6. Extra spaces between blocks.
        */

        it('splitTextNaturally trims.',
            function ()
            {
                const text = '    first second \n';
                const expected = [
                    'first',
                    'second',
                ];
                const result = Utils.splitTextNaturally(text, 8);

                assert.deepStrictEqual(result, expected);
            }
        );

        it('splitTextNaturally removes all whitespaces between blocks.',
            function ()
            {
                const text = 'first       \n\n\n\nsecond';
                const expected = [
                    'first',
                    'second',
                ];
                const result = Utils.splitTextNaturally(text, 8);

                assert.deepStrictEqual(result, expected);
            }
        );
    }
);
