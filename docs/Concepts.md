## Concept explanations

### Contact types vs contact classes:

A contact type (meaning Contact.type property of type ContactType) defines what _can be expected_ from a contact. \
This means: A contact has everything a contact needs (e.g. nickname, type and state). A member has everything a member needs (e.g. all information filled). And a wichtel has everything a wichtel needs (e.g. a gift giver and taker). \
A contact class (meaning the real Typescript class) on the other hand defines what a contact _can possibly provide_. \
This means: Every classes' properties described aboth can be set and saved, but are potentially not filled yet. \
Because we have the type system, we do not need to represent this in undefined/null properties, which make handling these a lot easier. At every point it is absolutely clear if a value is safe to use.

The main use for this concept is the first registration. The contact has to run through a lot of questions. While this happens we need a place we can store the gathered information in, thus we treat the contact as a member in class, allowing us to save what we get. \
After all questions were answered the contact type is set to member, declaring all information as set and usable. If we did this earlier we could not know which information is valid and which is not, and thus could not say if the registration process has been finished at least once in this event, which is important to know for the wichtel assignment because only members can become wichtels.

This is not ideal, and an alternative concept would be to introduce a fourth contact type and class (e.g. "registrant") or to give the contact the ability to store information. But both of these possibilities have their own drawbacks like more cases to consider, more complex code and less easy reuse of past events' information.
