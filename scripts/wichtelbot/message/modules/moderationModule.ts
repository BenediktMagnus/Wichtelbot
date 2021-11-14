import Config from "../../../utility/config";
import Database from "../../database/database";
import { KeyValuePairList } from "../../../utility/keyValuePair";
import Localisation from "../../../utility/localisation";
import { Message, State } from "../../endpoint/definitions";
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
        const members = this.database.getMembersWithState(State.Waiting);

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
}
