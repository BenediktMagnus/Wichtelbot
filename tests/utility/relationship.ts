import { assert } from "chai";
import { ExclusionData } from "../../scripts/wichtelbot/classes/exclusion";
import { ExclusionReason } from "../../scripts/wichtelbot/types/exclusionReason";
import GiftType from "../../scripts/wichtelbot/types/giftType";
import Member from "../../scripts/wichtelbot/classes/member";
import { Relationship } from "../../scripts/wichtelbot/classes/relationship";

export abstract class RelationshipTestUtility
{
    /**
     * Validate the relationship by checking that for every member exactly one relationship with him as giver and one as taker exists.
     */
    public static assertValidity (relationships: Relationship[], members: Member[]): void
    {
        for (const member of members)
        {
            let foundGiver = false;
            let foundTaker = false;

            for (const relationship of relationships)
            {
                assert.notEqual(relationship.giverId, relationship.takerId, 'Validity check, giver and taker are identical');

                if (relationship.giverId === member.id)
                {
                    assert.isFalse(foundGiver, 'Validity check, giver appeared twice');
                    foundGiver = true;
                }
                else if (relationship.takerId === member.id)
                {
                    assert.isFalse(foundTaker, 'Validity check, taker appeared twice');
                    foundTaker = true;
                }
            }

            assert.isTrue(foundGiver, 'Validity check, one giver is missing');
            assert.isTrue(foundTaker, 'Validity check, one taker is missing');
        }
    }

    /**
     * Proofs the compatibility of every relationship.
    */
    public static assertCompatibility (relationships: Relationship[], members: Member[], exclusions: ExclusionData[] = []): void
    {
        for (const relationship of relationships)
        {
            let giver: Member|null = null;
            let taker: Member|null = null;

            for (const member of members)
            {
                if (member.id === relationship.giverId)
                {
                    giver = member;
                }
                else if (member.id === relationship.takerId)
                {
                    taker = member;
                }
            }

            if (giver === null || taker === null)
            {
                // NOTE: One should think that an assert would assert a type, but it doesn't...

                assert.isNotNull(giver);
                assert.isNotNull(taker);

                continue;
            }

            const giftTypesAreTheSame = giver.information.giftTypeAsGiver === taker.information.giftTypeAsTaker;
            const giverHasAllGiftType = giver.information.giftTypeAsGiver === GiftType.All;
            const takerHasAllGiftType = taker.information.giftTypeAsTaker === GiftType.All;
            const isGiftTypeCompatible = giftTypesAreTheSame || giverHasAllGiftType || takerHasAllGiftType;

            assert.isTrue(isGiftTypeCompatible, 'Gift type compatibility check failed');

            const countriesAreTheSame = giver.information.country === taker.information.country;
            const noneHasAnalogueGiftType = giver.information.giftTypeAsGiver === GiftType.Analogue
                || taker.information.giftTypeAsTaker === GiftType.Analogue;
            const isInternationalCompatible = countriesAreTheSame || noneHasAnalogueGiftType || giver.information.internationalAllowed;

            assert.isTrue(isInternationalCompatible, 'International compatibility check failed');

            for (const exclusion of exclusions)
            {
                if (exclusion.reason == ExclusionReason.Wish)
                {
                    const isNoExclusion = exclusion.giverId !== giver.id || exclusion.takerId !== taker.id;

                    assert.isTrue(isNoExclusion, 'Exclusion compatibility check failed');
                }
            }
        }
    }
}
