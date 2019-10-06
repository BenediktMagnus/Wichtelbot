import * as Discord from 'discord.js';

/**
 * An interface for Discord clients. \
 * Used to reflect what is needed in the application's message classes. Using
 * this instead of the client class itself allows us to inject a testing class
 * in the unit tests. \
 * As needed, add more properties or methods to the interface and update the tests,
 * but these two should be enough for most things anyway. \
 * TODO: This should be changed into a full abstraction for clients used. With a
 *       unified API it wouldn't matter if it is Discord, IRC or anything else.
 */
export default interface Client
{
    channels: Discord.Collection<string, Discord.Channel>;
    fetchUser(id: string, cache?: boolean): Promise<Discord.User>;
}
