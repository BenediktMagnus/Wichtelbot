import Database from '../../database';
import { Exclusion } from '../../classes/exclusion';
import { ExclusionReason } from '../../types/exclusionReason';
import GiftType from '../../types/giftType';
import Member from '../../classes/member';

interface AssignmentCandidate
{
    /** The member that could possibly become the Wichtel child of this assignment. */
    wichtelChild: Member;
    /** The score for the Wichtel child. The higher the better. */
    score: number;
}

type AssignmentCandidateMap = Map<Member, Set<AssignmentCandidate>>;

export class AssignmentModule
{
    private database: Database;

    constructor (database: Database)
    {
        this.database = database;
    }

    /**
     * Run the assignment.
     * @returns True if successful, false otherwise.
     */
    public assign (): boolean
    {
        const members = this.database.getWaitingMember();
        const exclusions = this.database.getUserExclusions();
        const wishExclusions = this.extractWishExclusions(exclusions);
        const wichtelFromThePastExclusions = this.extractWichtelFromThePastExclusions(exclusions);

        const memberToCandidates = this.createAssignmentCandidateMap(members);

        for (const [member, candidates] of memberToCandidates)
        {
            for (const candidate of candidates.values())
            {
                if (this.isGiftTypeIncompatible(member, candidate.wichtelChild)
                    || this.isInternationalIncompatible(member, candidate.wichtelChild)
                    || this.isExcluded(member, candidate.wichtelChild, wishExclusions))
                {
                    candidates.delete(candidate);
                }

                candidate.score = this.calculateScore(member, candidate.wichtelChild, wichtelFromThePastExclusions);
            }

            if (candidates.size === 0)
            {
                // Empty candidates list means no valid solution for the assignment:
                return false;
            }

            this.sortCandidatesByScore(candidates);
        }

        return true;
    }

    private extractWishExclusions (exclusions: Exclusion[]): Exclusion[]
    {
        return exclusions.filter(exclusion => exclusion.reason === ExclusionReason.Wish);
    }

    private extractWichtelFromThePastExclusions (exclusions: Exclusion[]): Exclusion[]
    {
        return exclusions.filter(exclusion => exclusion.reason === ExclusionReason.WichtelFromThePast);
    }

    private createAssignmentCandidateMap (members: Member[]): AssignmentCandidateMap
    {
        const assignmentScores: AssignmentCandidateMap = new Map();

        for (const member of members)
        {
            const scores: Set<AssignmentCandidate> = new Set();

            for (const wichtelChild of members)
            {
                if (member === wichtelChild)
                {
                    continue;
                }

                scores.add(
                    {
                        wichtelChild: wichtelChild,
                        score: 0,
                    }
                );
            }

            assignmentScores.set(member, scores);
        }

        return assignmentScores;
    }

    private isGiftTypeIncompatible (member: Member, wichtelChild: Member): boolean
    {
        if (member.information.giftTypeAsGiver === wichtelChild.information.giftTypeAsTaker)
        {
            return false;
        }

        const result = (member.information.giftTypeAsGiver != GiftType.All) && (wichtelChild.information.giftTypeAsTaker != GiftType.All);

        return result;
    }

    private isInternationalIncompatible (member: Member, wichtelChild: Member): boolean
    {
        if (member.information.internationalAllowed)
        {
            return false;
        }

        if ((member.information.giftTypeAsGiver != GiftType.Analogue) && (wichtelChild.information.giftTypeAsTaker != GiftType.Analogue))
        {
            return false;
        }

        // NOTE: If one or both have "all" as gift type, they are compatible but should have a lower score if from different countries.

        const result = (member.information.country != wichtelChild.information.country);

        return result;
    }

    private isExcluded (member: Member, wichtelChild: Member, exclusions: Exclusion[]): boolean
    {
        for (const exclusion of exclusions)
        {
            if ((exclusion.giverId === member.id) && (exclusion.takerId === wichtelChild.id))
            {
                return true;
            }

            // TODO: Should this be optimised?
        }

        return false;
    }

    private calculateScore (member: Member, wichtelChild: Member, exclusions: Exclusion[]): number
    {
        let score = 0;

        if (member.information.giftTypeAsGiver === wichtelChild.information.giftTypeAsTaker)
        {
            score += 4;
        }

        if (member.information.country === wichtelChild.information.country)
        {
            score += 2;
        }
        else if (!member.information.internationalAllowed)
        {
            if ((member.information.giftTypeAsGiver == GiftType.All) && (wichtelChild.information.giftTypeAsTaker == GiftType.All))
            {
                // Both have "all" but the analogue way is blocked, thus a decrease:
                score -= 3;
            }
        }

        for (const exclusion of exclusions)
        {
            if ((exclusion.giverId === member.id) && (exclusion.takerId === wichtelChild.id))
            {
                score -= 8;
                break;
            }
        }

        return score;
    }

    private sortCandidatesByScore (candidates: Set<AssignmentCandidate>): void
    {
        const candidatesArray = Array.from(candidates);

        candidatesArray.sort(
            (a, b) =>
            {
                return a.score - b.score;
            }
        );

        candidates.clear();

        // NOTE: Sets save the order of the elements as they are inserted:
        for (const candidate of candidatesArray)
        {
            candidates.add(candidate);
        }
    }
}
