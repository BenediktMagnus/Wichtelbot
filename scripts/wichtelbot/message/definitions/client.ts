import { Channel } from "./channel";
import User from "./user";

/**
 * Interface for client abstraction. \
 * A client library (abstraction) must at least provide these things
 * to be able to being used as a bot client.
 */
export default interface Client
{
    getChannel(id: string): Channel;
    fetchUser(id: string): Promise<User>;
    // TODO: Destroy method "destroy"!
}
