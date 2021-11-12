import { assert } from "chai";
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
                assert.notEqual(relationship.giverId, relationship.takerId);

                if (relationship.giverId === member.id)
                {
                    assert.isFalse(foundGiver);
                    foundGiver = true;
                }
                else if (relationship.takerId === member.id)
                {
                    assert.isFalse(foundTaker);
                    foundTaker = true;
                }
            }

            assert.isTrue(foundGiver);
            assert.isTrue(foundTaker);
        }
    }

    /**
     * Proofs the compatibility of every relationship.
    */
    public static assertCompatibility (relationships: Relationship[], members: Member[]): void
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

            assert.isTrue(isGiftTypeCompatible);

            const countriesAreTheSame = giver.information.country === taker.information.country;
            const noneHasAnalogueGiftType = giver.information.giftTypeAsGiver === GiftType.Analogue
                || taker.information.giftTypeAsTaker === GiftType.Analogue;
            const isInternationalCompatible = countriesAreTheSame || noneHasAnalogueGiftType || giver.information.internationalAllowed;

            assert.isTrue(isInternationalCompatible);
        }
    }
}
