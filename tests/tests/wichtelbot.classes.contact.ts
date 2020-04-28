import 'mocha';
import { assert } from 'chai';

import Contact from '../../scripts/wichtelbot/classes/contact';
import ContactTestUtility from '../utility/contact';

describe('contact class',
    function ()
    {
        it('from ContactCoreData',
            function ()
            {
                const contactCoreData = ContactTestUtility.createRandomContactCoreData();

                const contact = new Contact(contactCoreData);

                assert.deepNestedInclude(contact, contactCoreData);
            }
        );

        it('from ContactData',
            function ()
            {
                const contactData = ContactTestUtility.createRandomContactData();

                const contact = new Contact(contactData);

                assert.deepNestedInclude(contact, contactData);
            }
        );

        it('from Contact',
            function ()
            {
                const oldContact = ContactTestUtility.createRandomContact();

                const newContact = new Contact(oldContact);

                assert.deepNestedInclude(newContact, oldContact);
            }
        );
    }
);
