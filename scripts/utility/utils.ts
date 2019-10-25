export default abstract class Utils
{
    public static getCurrentUnixTime (): number
    {
        return Math.floor(new Date().getTime() / 1000);
    }
}
