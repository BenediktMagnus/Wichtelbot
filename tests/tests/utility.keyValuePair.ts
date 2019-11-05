import 'mocha';
import { assert } from 'chai';
import { KeyValuePairList, KeyValuePair } from '../../scripts/utility/keyValuePair';
import GeneralTestUtility from '../utility/general';



describe('keyValuePairList',
    function ()
    {
        it('constructor with parameters',
            function ()
            {
                const key = GeneralTestUtility.createRandomString();
                const value = GeneralTestUtility.createRandomString();
                const keyValuePair: KeyValuePair = {
                    key: key,
                    value: value
                };

                const keyValuePairList = new KeyValuePairList(key, value);

                assert.strictEqual(keyValuePairList.length, 1);
                assert.deepStrictEqual(keyValuePairList[0], keyValuePair);
            }
        );

        it('constructor with key parameter',
            function ()
            {
                const key = GeneralTestUtility.createRandomString();

                const keyValuePairList = new KeyValuePairList(key);

                assert.strictEqual(keyValuePairList.length, 0);
            }
        );

        it('constructor with value parameter',
            function ()
            {
                const value = GeneralTestUtility.createRandomString();

                const keyValuePairList = new KeyValuePairList(undefined, value);

                assert.strictEqual(keyValuePairList.length, 0);
            }
        );

        it('constructor without parameters',
            function ()
            {
                const keyValuePairList = new KeyValuePairList();

                assert.strictEqual(keyValuePairList.length, 0);
            }
        );

        it('addPair',
            function ()
            {
                const key = GeneralTestUtility.createRandomString();
                const value = GeneralTestUtility.createRandomString();
                const keyValuePair: KeyValuePair = {
                    key: key,
                    value: value
                };

                const keyValuePairList = new KeyValuePairList();
                keyValuePairList.addPair(key, value);

                assert.strictEqual(keyValuePairList.length, 1);
                assert.deepStrictEqual(keyValuePairList[0], keyValuePair);
            }
        );
    }
);
