import { Message, State } from "../../endpoint/definitions";
import Config from "../../../utility/config";
import Database from "../../database/database";
import { Exclusion } from '../../classes/exclusion';
import { ExclusionReason } from '../../types/exclusionReason';
import { HandlingUtils } from "../handlingTools/handlingUtils";
import { KeyValuePairList } from "../../../utility/keyValuePair";
import Localisation from "../../../utility/localisation";
import Utils from "../../../utility/utils";
import WichtelEventPhase from "../../../utility/wichtelEvent";

export class ModerationModule
{
    protected database: Database;

    constructor (database: Database)
    {
        this.database = database;
    }

    public async sendStatus (message: Message): Promise<void>
    {
        // TODO: This could be improved with visualisations.
        // TODO: What about mods?

        const currentEventPhase = Localisation.translateWichtelEventPhase(Config.currentEventPhase);

        let nextEventPhase: WichtelEventPhase|null = null;
        let nextEventPhaseUnixTime: number|null = null;

        switch (Config.currentEventPhase)
        {
            case WichtelEventPhase.Waiting:
                nextEventPhase = WichtelEventPhase.Registration;
                nextEventPhaseUnixTime = Config.main.currentEvent.registration;
                break;
            case WichtelEventPhase.Registration:
                nextEventPhase = WichtelEventPhase.Wichteln;
                nextEventPhaseUnixTime = Config.main.currentEvent.assignment;
                break;
            case WichtelEventPhase.Wichteln:
                nextEventPhase = WichtelEventPhase.Ended;
                nextEventPhaseUnixTime = Config.main.currentEvent.end;
                break;
            case WichtelEventPhase.Ended:
                // No next phase
                break;
        }

        let eventPhaseString: string;

        if ((nextEventPhase === null) || (nextEventPhaseUnixTime === null))
        {
            const parameters = new KeyValuePairList('currentEventPhase', currentEventPhase);

            eventPhaseString = Localisation.texts.moderationStatusEventPhase.process(message.author, parameters);
        }
        else
        {
            const parameters = new KeyValuePairList();
            parameters.addPair('currentEventPhase', currentEventPhase);
            parameters.addPair('nextEventPhase', Localisation.translateWichtelEventPhase(nextEventPhase));

            const registrationDateStrings = Utils.dateToDateStrings(new Date(nextEventPhaseUnixTime * 1000));
            parameters.addPair('year', registrationDateStrings.year);
            parameters.addPair('month', registrationDateStrings.month);
            parameters.addPair('day', registrationDateStrings.day);
            parameters.addPair('hour', registrationDateStrings.hour);
            parameters.addPair('minute', registrationDateStrings.minute);

            eventPhaseString = Localisation.texts.moderationStatusEventPhaseWithNextPhase.process(message.author, parameters);
        }

        const contactCount = this.database.getContactCount();
        const waitingMemberCount = this.database.getWaitingMemberCount();
        const giftTypeStatistics = this.database.getGiftTypeStatistics();
        const parcelStatistics = this.database.getParcelStatistics();

        const parameters = new KeyValuePairList();
        parameters.addPair('currentEventName', Config.main.currentEvent.name);
        parameters.addPair('eventPhaseString', eventPhaseString);
        parameters.addPair('contactCount', `${contactCount}`);
        parameters.addPair('waitingMemberCount', `${waitingMemberCount}`);
        parameters.addPair('analogueGiverCount', `${giftTypeStatistics.analogueGiverCount}`);
        parameters.addPair('digitalGiverCount', `${giftTypeStatistics.digitalGiverCount}`);
        parameters.addPair('allGiverCount', `${giftTypeStatistics.allGiverCount}`);
        parameters.addPair('analogueTakerCount', `${giftTypeStatistics.analogueTakerCount}`);
        parameters.addPair('digitalTakerCount', `${giftTypeStatistics.digitalTakerCount}`);
        parameters.addPair('allTakerCount', `${giftTypeStatistics.allTakerCount}`);
        parameters.addPair('parcelSentCount', `${parcelStatistics.sentCount}`);
        parameters.addPair('parcelReceivedCount', `${parcelStatistics.receivedCount}`);

        const answer = Localisation.texts.moderationStatus.process(message.author, parameters);

        await message.reply(answer);
    }

    /**
     * End the registration phase and give all members that have completed the registration the "assignment" status.
     */
    public async endRegistration (message: Message): Promise<void>
    {
        const members = this.database.getMembersByState(State.Waiting);

        for (const member of members)
        {
            member.state = State.Assignment;
        }

        // NOTE: We can use "updateContacts" instead of "updateMembers" because we changed the state, which is only part of the contact:
        this.database.updateContacts(members);

        const parameters = new KeyValuePairList('waitingMemberCount', `${members.length}`);
        const answer = Localisation.texts.moderationRegistrationEnded.process(message.author, parameters);

        await message.reply(answer);
    }

    /**
     * Extract the user exclusions from all members that have completed the registration and save them as exclusion wishes.
     */
    public prepareWishedUserExclusions (): void
    {
        this.database.deleteUserExclusionWishes();

        const exclusions: Exclusion[] = [];

        const members = this.database.getMembersByState(State.Waiting);

        for (const member of members)
        {
            if (member.information.userExclusion == '-') // TODO: Bad hard coded value.
            {
                continue;
            }

            // TODO: The username handling here is Discord specific. This should be unified/standardised or abstracted.
            const userExclusionString = member.information.userExclusion.toLowerCase();
            const userExclusions = userExclusionString.split(/[^a-z0-9\-_]+/);

            for (const excludedUsername of userExclusions)
            {
                if (this.database.hasContact(excludedUsername))
                {
                    const excludedContact = this.database.getContact(excludedUsername);

                    const exclusion = new Exclusion(
                        {
                            giverId: member.id,
                            takerId: excludedContact.id,
                            reason: ExclusionReason.Wish
                        }
                    );

                    exclusions.push(exclusion);
                }
            }
        }

        this.database.saveUserExclusions(exclusions);
    }

    public async distributeWichtelProfiles (message: Message): Promise<void>
    {
        // TODO: This is relatively slow. Could it be sped up? Getting the contacts/members could be cached or maybe the profile is slow?

        const relationships = this.database.getRelationships();

        for (const relationship of relationships)
        {
            const giver = this.database.getContact(relationship.giverId);
            const taker = this.database.getMember(relationship.takerId);

            if (giver.state == State.Wichteling) {
                continue;
            }

            const profileOverviewText = Localisation.texts.wichtelProfileDistribution.process(giver);
            const profileVisualisations = HandlingUtils.getProfileVisualisations(taker, false);

            const giverUser = await message.client.fetchUser(giver.id);
            await giverUser.send(profileOverviewText, profileVisualisations);

            giver.state = State.Wichteling;
            this.database.updateContact(giver);
        }

        const parameters = new KeyValuePairList('profileCount', `${relationships.length}`);
        const answer = Localisation.texts.moderationProfilesDistributed.process(message.author, parameters);

        await message.reply(answer);
    }

    public async distributeSteamFriendshipCodes (message: Message): Promise<void>
    {
        const wichtels = this.database.getWichtels();

        const codes: string[] = [];

        for (const wichtel of wichtels)
        {
            const code = wichtel.information.steamFriendshipCode.trim();

            if (HandlingUtils.isValidSteamFriendshipCode(code))
            {
                codes.push(wichtel.information.steamFriendshipCode);
            }
        }

        const codesString = codes.join('\n');

        for (const wichtel of wichtels)
        {
            const parameters = new KeyValuePairList('steamFriendshipCodes', codesString);
            const text = Localisation.texts.steamFriendshipCodeDistribution.process(wichtel, parameters);

            const user = await message.client.fetchUser(wichtel.id);
            await user.send(text);
        }

        const receiversString = wichtels.map(wichtel => wichtel.name).join('\n');

        const parameters = new KeyValuePairList();
        parameters.addPair('steamFriendshipCodes', `${codesString}`);
        parameters.addPair('contactNames', `${receiversString}`);
        const answer = Localisation.texts.moderationSteamFriendshipCodesDistributed.process(message.author, parameters);

        await message.reply(answer);
    }
}
