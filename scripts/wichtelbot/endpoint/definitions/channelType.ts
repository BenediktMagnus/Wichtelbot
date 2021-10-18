export enum ChannelType
{
    /**
     * Personal communication with a single user.
     */
    Personal,
    /**
     * Open communication with a (big) changing group of people.
     */
    Server,
    /**
     * This channel should be ignored. \
     * Used for non-usable channels like voice and store channels.
     */
    Ignore,
}
