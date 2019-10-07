import User from "./user";
import { Channel } from "./channel";

/**
 * Interface for client abstraction. \
 * A client library (abstraction) must at least provide these things
 * to be able to being used as a bot client.
 */
export default interface Client
{
    channels: Map<string, Channel>;
    getUser(id: string): Promise<User>;
}
