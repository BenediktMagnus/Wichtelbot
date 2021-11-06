import { Component } from "./component/component";
import { Visualisation } from "./visualisation/visualisation";

/** Additions to a text message. \
 * If Visualisation[]: \
 * - Provide a finer control for how the client library may present the message.
 * If Component[]: \
 * - Components to send with the message. The client library decides if and how to present these.
 * If string: \
 * - An optional URL to an image. The client library must decide how it uses this information.
*    It can show the image directly, attach it to the message, send it separately or simply send the URL (if nothing else is possible).
*/
export type Additions = Visualisation[] | Component[] | string;
