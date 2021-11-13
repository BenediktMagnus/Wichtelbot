import 'mocha';
import { AssignmentModule } from '../../scripts/wichtelbot/message/modules/assignmentModule';
import ContactTestUtility from '../utility/contact';
import Database from '../../scripts/wichtelbot/database/database';
import Member from '../../scripts/wichtelbot/classes/member';

const testCount = 1000;

function performanceTest (this: Mocha.Suite): void
{
    let database: Database;
    let assignmentModule: AssignmentModule;

    const members: Member[] = [];

    // We do not want a timeout in a performance test:
    this.timeout(0);

    before(
        function ()
        {
            for (let i = 0; i < testCount; i++)
            {
                const member = ContactTestUtility.createRandomMemberWithMostCompatibleInformation();

                members.push(member);
            }
        }
    );

    beforeEach(
        function ()
        {
            // Initialise dependencies:
            database = new Database('mainTest', 'logTest', true);
            assignmentModule = new AssignmentModule(database);

            for (const member of members)
            {
                database.saveContact(member);
                database.saveMember(member);
            }
        }
    );

    afterEach(
        function ()
        {
            database.close();
        }
    );

    it('members.',
        function ()
        {
            assignmentModule.assign();
        }
    );
}

describe.skip('Performance',
    function ()
    {
        describe('of assignment for ' + testCount.toString(), performanceTest);
    }
);
