export default abstract class GeneralTestUtility
{
    public static createRandomString (): string
    {
        const currentTime = new Date();

        const randomNumber = Math.random();

        const randomString = currentTime.getTime().toString() + '-' + randomNumber.toString();

        return randomString;
    }

    public static createRandomBoolean (): boolean
    {
        const randomBoolean = Math.random() >= 0.5;

        return randomBoolean;
    }

    public static createRandomInteger (): number
    {
        const randomNumber = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

        return randomNumber;
    }
}
