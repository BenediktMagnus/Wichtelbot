export default abstract class Utils
{
    private static readonly defaultMaxWordLength = 100;

    public static getCurrentUnixTime (): number
    {
        return Math.floor(new Date().getTime() / 1000);
    }

    /**
     * Split text naturally between words if possible and removing unnecessary whitespaces at the break points.
     * @param text The text to split.
     * @param blockLength The maximum length per block.
     * @param maxWordLength The maximum length of a word before it will be cut. Defaults to half the block length (with a maximum of defaultMaxWordLength).
     * @returns The separated blocks as a list of strings.
     */
    public static splitTextNaturally (text: string, blockLength: number, maxWordLength?: number): string[]
    {
        // TODO: This could be replaced with Discord.Util.splitMessage().

        const trimmedText = text.trim();

        if (trimmedText.length <= blockLength)
        {
            return [trimmedText];
        }

        let minLength: number;
        if (maxWordLength !== undefined)
        {
            minLength = blockLength - maxWordLength;
        }
        else
        {
            minLength = Math.min(Math.round(blockLength / 2), Utils.defaultMaxWordLength);
        }

        // The following regex will find as much text as possible that fit inside the given block
        // length and ends with a whitespace character. The second match is the rest after the space.
        const regex = new RegExp('^([\\s\\S]{1,' + blockLength.toString() + '})\\b[\\s]{1}([\\s\\S]*)', '');

        const result: string[] = [];

        let rest = trimmedText;
        while (rest.length > blockLength)
        {
            const match = regex.exec(rest);

            if (match !== null)
            {
                const entry = match[1];

                if (entry.length >= minLength)
                {
                    result.push(entry);

                    rest = match[2];
                    rest = rest.trimLeft(); // There must be no space characters at the beginning of blocks.

                    continue; // Everything is fine, we can continue with the next match.
                }
            }

            // If we are here, the match is either null, which means there could no whitespace character found
            // within the block length, or the last word after it is too long, which would makes the new entry
            // smaller than it must be (minLength).
            // In this case, we must add a hard cutted word.

            const cuttedWord = rest.slice(0, blockLength);
            result.push(cuttedWord);

            rest = rest.slice(blockLength);
        }

        if (rest.length > 0)
        {
            result.push(rest);
        }

        return result;
    }
}
