import Config from "../../scripts/utility/config";

export default abstract class ConfigTestUtility
{
    public static setToWaitingPhase (): void
    {
        Config.main.currentEvent.registration = Number.MAX_SAFE_INTEGER - 2;
        Config.main.currentEvent.assignment = Number.MAX_SAFE_INTEGER - 1;
        Config.main.currentEvent.end = Number.MAX_SAFE_INTEGER;
    }

    public static setToRegistrationPhase (): void
    {
        Config.main.currentEvent.registration = 0;
        Config.main.currentEvent.assignment = Number.MAX_SAFE_INTEGER - 1;
        Config.main.currentEvent.end = Number.MAX_SAFE_INTEGER;
    }

    public static setToWichtelnPhase (): void
    {
        Config.main.currentEvent.registration = 0;
        Config.main.currentEvent.assignment = 1;
        Config.main.currentEvent.end = Number.MAX_SAFE_INTEGER;
    }

    public static setToEndPhase (): void
    {
        Config.main.currentEvent.registration = 0;
        Config.main.currentEvent.assignment = 1;
        Config.main.currentEvent.end = 2;
    }

    public static resetConfig (): void
    {
        Config.reload();
    }
}
