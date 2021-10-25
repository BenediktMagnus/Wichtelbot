import { ChannelType } from "./channelType";
import { Component } from "./component/component";

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
     * @param components An optional list of components to send with the message. The client library decides if and how to present these.
     * @param imageUrl An optional URL to an image. The client library must decide how it
     * uses this information. It can show the image directly, attach it to the message,
     * send it separately or simply send the URL (if nothing else is possible).
     */
    send (text: string, components?: Component[], imageUrl?: string): void;
}
