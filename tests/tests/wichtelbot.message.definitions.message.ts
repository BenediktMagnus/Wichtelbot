import 'mocha';
import { assert } from 'chai';

import GeneralTestUtility from '../utility/general';
import { MessageWithParser } from '../../scripts/wichtelbot/message/definitions/message';

class TestMessageWithParser extends MessageWithParser
{
    protected content: string;

    constructor (content: string)
    {
        super();

        this.content = content;
    }
}

describe('MessageWithParser class',
    function ()
    {
        let command: string;
        let parameter1: string;
        let parameter2: string;
        let parameters: string;
        let content: string;

        beforeEach(
            function ()
            {
                command = GeneralTestUtility.createRandomString();
                parameter1 = GeneralTestUtility.createRandomString();
                parameter2 = GeneralTestUtility.createRandomString();
                parameters = parameter1 + ' ' + parameter2;
                content = command + ' ' + parameters + ' ';
            }
        );

        it('has working space parsing.',
            function ()
            {
                const testMessageWithParser = new TestMessageWithParser(content);

                testMessageWithParser.parse();

                assert.strictEqual(testMessageWithParser.command, command);
                assert.strictEqual(testMessageWithParser.parameters, parameters);
            }
        );

        it('has working linebreak parsing.',
            function ()
            {
                parameters = parameter1 + '\n' + parameter2;
                content = command + '\n' + parameters + '\n';

                const testMessageWithParser = new TestMessageWithParser(content);

                testMessageWithParser.parse();

                assert.strictEqual(testMessageWithParser.command, command);
                assert.strictEqual(testMessageWithParser.parameters, parameters);
            }
        );

        it('has working command auto parsing.',
            function ()
            {
                const testMessageWithParser = new TestMessageWithParser(content);

                assert.strictEqual(testMessageWithParser.command, command);
                assert.strictEqual(testMessageWithParser.parameters, parameters);
            }
        );

        it('has working parameters auto parsing.',
            function ()
            {
                const testMessageWithParser = new TestMessageWithParser(content);

                assert.strictEqual(testMessageWithParser.parameters, parameters);
                assert.strictEqual(testMessageWithParser.command, command);
            }
        );

        it('has working parameter splitting.',
            function ()
            {
                const testMessageWithParser = new TestMessageWithParser(content);

                const splittetParameters = testMessageWithParser.splitParameters();
                const expectedParameters = [
                    parameter1,
                    parameter2
                ];

                assert.deepStrictEqual(splittetParameters, expectedParameters);
            }
        );
    }
);
