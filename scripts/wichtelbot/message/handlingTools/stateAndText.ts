import { State } from "../../endpoint/definitions";
import TokenString from "../../../utility/tokenString";

export interface StateAndText
{
    state: State,
    text: TokenString,
}
