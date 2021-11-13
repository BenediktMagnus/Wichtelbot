import 'mocha';
import { assert } from 'chai';
import { AssignmentModule } from '../../scripts/wichtelbot/message/modules/assignmentModule';
import ContactTestUtility from '../utility/contact';
import Database from '../../scripts/wichtelbot/database/database';
import GiftType from '../../scripts/wichtelbot/types/giftType';
import Member from '../../scripts/wichtelbot/classes/member';
import { RelationshipTestUtility } from '../utility/relationship';
import { ExclusionData } from '../../scripts/wichtelbot/classes/exclusion';
import { ExclusionReason } from '../../scripts/wichtelbot/types/exclusionReason';

describe('assignment module',
    function ()
    {
        let database: Database;
        let assignmentModule: AssignmentModule;

        beforeEach(
            function ()
            {
                // Initialise dependencies:
                database = new Database('mainTest', 'logTest', true);
                assignmentModule = new AssignmentModule(database);
            }
        );

        afterEach(
            function ()
            {
                database.close();
            }
        );

        it('can assign three simple members.',
            function ()
            {
                const newMembers: Member[] = [];

                for (let i = 0; i < 3; i++)
                {
                    const newMember = ContactTestUtility.createRandomMemberWithMostCompatibleInformation();

                    newMembers.push(newMember);
                    database.saveContact(newMember);
                    database.saveMember(newMember);
                }

                const successful = assignmentModule.assign();

                assert.isTrue(successful);

                const relationships = database.getRelationships();

                assert.equal(relationships.length, 3);

                RelationshipTestUtility.assertValidity(relationships, newMembers);
            }
        );

        it('can assign three members all with analogue gift types',
            function ()
            {
                const newMembers: Member[] = [];

                for (let i = 0; i < 3; i++)
                {
                    const newMember = ContactTestUtility.createRandomMemberWithMostCompatibleInformation();
                    newMember.information.giftTypeAsGiver = GiftType.Analogue;
                    newMember.information.giftTypeAsTaker = GiftType.Analogue;

                    newMembers.push(newMember);
                    database.saveContact(newMember);
                    database.saveMember(newMember);
                }

                const successful = assignmentModule.assign();

                assert.isTrue(successful);

                const relationships = database.getRelationships();

                assert.equal(relationships.length, 3);

                RelationshipTestUtility.assertValidity(relationships, newMembers);
            }
        );

        it('can assign three members all with digital gift types',
            function ()
            {
                const newMembers: Member[] = [];

                for (let i = 0; i < 3; i++)
                {
                    const newMember = ContactTestUtility.createRandomMemberWithMostCompatibleInformation();
                    newMember.information.giftTypeAsGiver = GiftType.Digital;
                    newMember.information.giftTypeAsTaker = GiftType.Digital;

                    newMembers.push(newMember);
                    database.saveContact(newMember);
                    database.saveMember(newMember);
                }

                const successful = assignmentModule.assign();

                assert.isTrue(successful);

                const relationships = database.getRelationships();

                assert.equal(relationships.length, 3);

                RelationshipTestUtility.assertValidity(relationships, newMembers);
            }
        );

        it('can assign members, one with analogue, one with digital und two with all gift type',
            function ()
            {
                const newMembers: Member[] = [];

                for (let i = 0; i < 4; i++)
                {
                    const newMember = ContactTestUtility.createRandomMemberWithMostCompatibleInformation();

                    newMembers.push(newMember);
                }

                newMembers[0].information.giftTypeAsGiver = GiftType.Analogue;
                newMembers[0].information.giftTypeAsTaker = GiftType.Analogue;
                newMembers[0].id = 'Analogue';
                newMembers[1].information.giftTypeAsGiver = GiftType.Digital;
                newMembers[1].information.giftTypeAsTaker = GiftType.Digital;
                newMembers[1].id = 'Digital';
                newMembers[2].information.giftTypeAsGiver = GiftType.All;
                newMembers[2].information.giftTypeAsTaker = GiftType.All;
                newMembers[2].id = 'All 1';
                newMembers[3].information.giftTypeAsGiver = GiftType.All;
                newMembers[3].information.giftTypeAsTaker = GiftType.All;
                newMembers[3].id = 'All 2';

                for (const newMember of newMembers)
                {
                    newMember.information.contactId = newMember.id;

                    database.saveContact(newMember);
                    database.saveMember(newMember);
                }

                const successful = assignmentModule.assign();

                assert.isTrue(successful);

                const relationships = database.getRelationships();

                assert.equal(relationships.length, 4);

                RelationshipTestUtility.assertValidity(relationships, newMembers);
                RelationshipTestUtility.assertCompatibility(relationships, newMembers);
            }
        );

        it('can assign members with exclusions',
            function ()
            {
                const newMembers: Member[] = [];

                for (let i = 0; i < 4; i++)
                {
                    const newMember = ContactTestUtility.createRandomMemberWithMostCompatibleInformation();

                    newMembers.push(newMember);
                    database.saveContact(newMember);
                    database.saveMember(newMember);
                }

                const exclusions: ExclusionData[] = [
                    {
                        giverId: newMembers[0].id,
                        takerId: newMembers[1].id,
                        reason: ExclusionReason.Wish,
                    },
                    {
                        giverId: newMembers[0].id,
                        takerId: newMembers[2].id,
                        reason: ExclusionReason.Wish,
                    },
                    {
                        giverId: newMembers[1].id,
                        takerId: newMembers[2].id,
                        reason: ExclusionReason.Wish,
                    },
                    {
                        giverId: newMembers[1].id,
                        takerId: newMembers[3].id,
                        reason: ExclusionReason.Wish,
                    },
                ];

                database.saveUserExclusions(exclusions);

                const successful = assignmentModule.assign();

                assert.isTrue(successful);

                const relationships = database.getRelationships();

                assert.equal(relationships.length, 4);

                RelationshipTestUtility.assertValidity(relationships, newMembers);
                RelationshipTestUtility.assertCompatibility(relationships, newMembers, exclusions);
            }
        );

        it('cannot assign with zero members',
            function ()
            {
                const successful = assignmentModule.assign();

                assert.isFalse(successful);
            }
        );

        it('cannot assign with one member',
            function ()
            {
                const newMember = ContactTestUtility.createRandomMemberWithMostCompatibleInformation();

                database.saveContact(newMember);
                database.saveMember(newMember);

                const successful = assignmentModule.assign();

                assert.isFalse(successful);
            }
        );

        it('cannot assign with two members',
            function ()
            {
                const newMembers: Member[] = [];

                for (let i = 0; i < 2; i++)
                {
                    const newMember = ContactTestUtility.createRandomMemberWithMostCompatibleInformation();

                    newMembers.push(newMember);
                    database.saveContact(newMember);
                    database.saveMember(newMember);
                }

                const successful = assignmentModule.assign();

                assert.isFalse(successful);
            }
        );

        it('cannot assign members, two with analogue and one with digital gift type',
            function ()
            {
                const newMembers: Member[] = [];

                for (let i = 0; i < 3; i++)
                {
                    const newMember = ContactTestUtility.createRandomMemberWithMostCompatibleInformation();

                    newMembers.push(newMember);
                    database.saveContact(newMember);
                }

                newMembers[0].information.giftTypeAsGiver = GiftType.Analogue;
                newMembers[0].information.giftTypeAsTaker = GiftType.Analogue;
                newMembers[1].information.giftTypeAsGiver = GiftType.Analogue;
                newMembers[1].information.giftTypeAsTaker = GiftType.Analogue;
                newMembers[2].information.giftTypeAsGiver = GiftType.Digital;
                newMembers[2].information.giftTypeAsTaker = GiftType.Digital;

                for (const newMember of newMembers)
                {
                    database.saveMember(newMember);
                }

                const successful = assignmentModule.assign();

                assert.isFalse(successful);
            }
        );
    }
);
