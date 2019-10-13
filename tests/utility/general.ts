export default class GeneralTestUtility
{
    public static createRandomString (): string
    {
        const currentTime = new Date();

        const randomNumber = Math.random();

        const randomString = currentTime.getTime().toString() + '-' + randomNumber.toString();

        return randomString;
    }
}
