import Database from '../../database/database';
import { Exclusion } from '../../classes/exclusion';
import { ExclusionReason } from '../../types/exclusionReason';
import GiftType from '../../types/giftType';
import Member from '../../classes/member';
import { RelationshipData } from '../../classes/relationship';
import { State } from '../../endpoint/definitions';

interface Candidate
{
    /** The member that could possibly become the taker Wichtel of the assignment. */
    taker: Member;
    /** The score for the taker Wichtel. The higher the better. */
    score: number;
}

interface Pairing
{
    /** The future giver Wichtel. */
    giver: Member;
    /** The list of possible candidates for this assignment. */
    candidates: Candidate[];
}

interface Assignment
{
    giver: Member;
    taker: Member;
}

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
    public runAssignment (): boolean // TODO: Return the reason for failure.
    {
        const members = this.database.getMembersByState(State.Assignment);

        if (members.length === 0)
        {
            return false;
        }

        const pairings = this.assemblePairings(members);

        const preparationResult = this.prepareCandidates(pairings);

        if (!preparationResult)
        {
            return false;
        }

        const assignments = this.assignCandidates(pairings);

        if (assignments.length === 0)
        {
            return false;
        }

        const relationships: RelationshipData[] = assignments.map(
            assignment =>
            {
                return {
                    giverId: assignment.giver.id,
                    takerId: assignment.taker.id,
                };
            }
        );

        this.database.saveRelationships(relationships);

        return true;
    }

    private assemblePairings (members: Member[]): Pairing[]
    {
        const pairings: Pairing[] = [];

        for (const member of members)
        {
            const candidates: Candidate[] = [];

            for (const takerWichtel of members)
            {
                if (member === takerWichtel)
                {
                    continue;
                }

                candidates.push(
                    {
                        taker: takerWichtel,
                        score: 0,
                    }
                );
            }

            pairings.push(
                {
                    giver: member,
                    candidates: candidates,
                }
            );
        }

        return pairings;
    }

    /**
     * Prepare the canidates assignment map by removing the incompatible members and calculating the scores/rank.
     * @returns True if successful, false otherwise.
     */
    private prepareCandidates (pairings: Pairing[]): boolean
    {
        const exclusions = this.database.getUserExclusions();
        const wishExclusions = this.extractWishExclusions(exclusions);
        const wichtelFromThePastExclusions = this.extractWichtelFromThePastExclusions(exclusions);

        for (const pairing of pairings)
        {
            for (let i = pairing.candidates.length - 1; i >= 0; i--)
            {
                const candidate = pairing.candidates[i];

                if (this.isGiftTypeIncompatible(pairing.giver, candidate.taker)
                    || this.isInternationalIncompatible(pairing.giver, candidate.taker)
                    || this.isExcluded(pairing.giver, candidate.taker, wishExclusions))
                {
                    pairing.candidates.splice(i, 1);
                }

                candidate.score = this.calculateScore(pairing.giver, candidate.taker, wichtelFromThePastExclusions);
            }

            if (pairing.candidates.length === 0)
            {
                // Empty candidates list means no valid solution for the assignment:
                return false;
            }

            this.sortCandidatesByScore(pairing.candidates);
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

    private isGiftTypeIncompatible (giverWichtel: Member, takerWichtel: Member): boolean
    {
        if (giverWichtel.information.giftTypeAsGiver === takerWichtel.information.giftTypeAsTaker)
        {
            return false;
        }

        const result = (giverWichtel.information.giftTypeAsGiver != GiftType.All)
            && (takerWichtel.information.giftTypeAsTaker != GiftType.All);

        return result;
    }

    private isInternationalIncompatible (giverWichtel: Member, takerWichtel: Member): boolean
    {
        if (giverWichtel.information.internationalAllowed)
        {
            return false;
        }

        if ((giverWichtel.information.giftTypeAsGiver != GiftType.Analogue)
            && (takerWichtel.information.giftTypeAsTaker != GiftType.Analogue))
        {
            return false;
        }

        // NOTE: If one or both have "all" as gift type, they are compatible but should have a lower score if from different countries.

        const result = (giverWichtel.information.country != takerWichtel.information.country);

        return result;
    }

    private isExcluded (giverWichtel: Member, takerWichtel: Member, exclusions: Exclusion[]): boolean
    {
        for (const exclusion of exclusions)
        {
            if ((exclusion.giverId === giverWichtel.id) && (exclusion.takerId === takerWichtel.id))
            {
                return true;
            }
        }

        return false;
    }

    private calculateScore (giverWichtel: Member, takerWichtel: Member, exclusions: Exclusion[]): number
    {
        let score = 0;

        if (giverWichtel.information.giftTypeAsGiver === takerWichtel.information.giftTypeAsTaker)
        {
            score += 4;
        }

        if (giverWichtel.information.country === takerWichtel.information.country)
        {
            score += 2;
        }
        else if (!giverWichtel.information.internationalAllowed)
        {
            if ((giverWichtel.information.giftTypeAsGiver == GiftType.All) && (takerWichtel.information.giftTypeAsTaker == GiftType.All))
            {
                // Both have "all" but the analogue way is blocked, thus a decrease:
                score -= 3;
            }
        }

        for (const exclusion of exclusions)
        {
            if ((exclusion.giverId === giverWichtel.id) && (exclusion.takerId === takerWichtel.id))
            {
                score -= 8;
                break;
            }
        }

        return score;
    }

    private sortCandidatesByScore (candidates: Candidate[]): void
    {
        candidates.sort(
            (a, b) =>
            {
                return a.score - b.score;
            }
        );
    }

    private assignCandidates (pairings: Pairing[]): Assignment[]
    {
        const priorities: Set<Member> = new Set();

        while (priorities.size < pairings.length)
        {
            const remaining = this.clonePairings(pairings);
            this.sortPairings(remaining, priorities);

            const completed: Assignment[] = [];

            while (true)
            {
                const pairing = remaining.shift();

                if (pairing === undefined)
                {
                    // All pairings have been assigned.
                    break;
                }

                if (pairing.candidates.length == 0)
                {
                    // If there are no candidates left, we have an incomplete solution.
                    // In this case, we add the member to the priority list and rerun the assignment.

                    if (priorities.has(pairing.giver))
                    {
                        // If the member is already in the priority list, there is no possible solution with this algorithm:
                        return [];
                    }
                    else
                    {
                        priorities.add(pairing.giver);
                    }

                    break;
                }

                const [firstCandidate] = pairing.candidates;

                const assignment: Assignment = {
                    giver: pairing.giver,
                    taker: firstCandidate.taker,
                };

                completed.push(assignment);

                for (const pairing of remaining)
                {
                    for (let i = pairing.candidates.length - 1; i >= 0; i--)
                    {
                        const candidate = pairing.candidates[i];

                        // Remove the candidate from all other remaining pairings for it to not be assigned twice and
                        // the giver from the taker's candidates to prevent a one-to-one circular assignment:
                        if ((candidate.taker === assignment.taker)
                            || ((pairing.giver === assignment.taker) && (candidate.taker === assignment.giver)))
                        {
                            pairing.candidates.splice(i, 1);
                        }
                    }
                }

                // Sort again because the assignment changed all pairing scores:
                this.sortPairings(remaining, priorities);
            }

            if (completed.length === pairings.length)
            {
                // Found a solution!

                return completed;
            }
        }

        // If all members are prioritised, there could no possible solution be found:
        return [];
    }

    private clonePairings (pairings: Pairing[]): Pairing[]
    {
        const clones: Pairing[] = [];

        for (const pairing of pairings)
        {
            const clone: Pairing = {
                giver: pairing.giver,
                candidates: [...pairing.candidates],
            };

            clones.push(clone);
        }

        return clones;
    }

    private sortPairings (pairing: Pairing[], priorities: Set<Member>): void
    {
        pairing.sort(
            (pairingA: Pairing, pairingB: Pairing): number =>
            {
                const aIsPriority = priorities.has(pairingA.giver);
                const bIsPriority = priorities.has(pairingB.giver);

                if (aIsPriority || bIsPriority)
                {
                    if (aIsPriority && bIsPriority)
                    {
                        return 0;
                    }
                    else if (aIsPriority)
                    {
                        return -1;
                    }
                    else
                    {
                        return 1;
                    }
                }

                // The value of the chain is determined by the accumulated weighting of all the wichtel plus their total number.
                // The higher the value, the less important the user is for the selection.
                // This sets a balance between "find the most valuable combinations", "make sure everyone is served" and "try to avoid
                // making too poor assignments".
                const accumulateScores = (totalScore: number, candidate: Candidate): number => totalScore + candidate.score;

                const totalScoreA = pairingA.candidates.reduce(accumulateScores, 0) + pairingA.candidates.length;
                const totalScoreB = pairingB.candidates.reduce(accumulateScores, 0) + pairingB.candidates.length;

                let result = totalScoreA - totalScoreB;

                // If both scores are the same, the number of candidates is used as a tie breaker:
                if (result === 0)
                {
                    result = pairingA.candidates.length - pairingB.candidates.length;
                }

                return result;
            }
        );
    }
}
