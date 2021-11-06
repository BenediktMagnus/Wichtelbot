import { Additions } from ".";
import { ChannelType } from "./channelType";

/**
 * Communication happens in channels, messages are sent to channels, users interact in channels.
 */
export interface Channel
{
    /**
     * The identifier of the channel. Must be unique for all channels.
     */
    id: string;
    /**
     * The type of the channel, important for how messages from it are handled.
     */
    type: ChannelType;
    /**
     * A method to send a message to the channel.
     * @param text The text to send.
     * @param additions Optional additions.
     */
    send (text: string, additions?: Additions): Promise<void>;
}
