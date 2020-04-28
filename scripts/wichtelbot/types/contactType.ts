enum ContactType
{
    /**
     * After first contact, only contains basic contact data.
     */
    Contact = 'contact',
    /**
     * After first full registration. Besides the contact data, these ones have information attached.
     */
    Member = 'member',
    /**
     * After the assignment has happened, includes contact data, information and gift giver/taker IDs.
     */
    Wichtel = 'wichtel',
}

export default ContactType;
