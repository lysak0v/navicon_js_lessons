using System;
using System.Linq;
using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Tooling.Connector;
using Navicon.Common.Entities;

namespace Navicon.Console
{
    public static class EntityHandler
    {
        public static void UpdateContacts(CrmServiceClient client)
        {
            QueryExpression queryTask1 = new QueryExpression(lys_communication.EntityLogicalName);
            queryTask1.ColumnSet = new ColumnSet(true);
            queryTask1.NoLock = true;
            queryTask1.Criteria.AddCondition(lys_communication.Fields.lys_main, ConditionOperator.Equal, true);


            var retrieveResult = client.RetrieveMultiple(queryTask1);
            var entities = retrieveResult.Entities.Select(e => e.ToEntity<lys_communication>());
            foreach (var entity in entities)
            {
                var retrievedContact = client.Retrieve(Contact.EntityLogicalName, entity.lys_contactid.Id,
                    new ColumnSet(Contact.Fields.EMailAddress1, Contact.Fields.Telephone1));

                if (entity.lys_main == true && !string.IsNullOrEmpty(entity.lys_phone))
                {
                    if (retrievedContact.GetAttributeValue<string>(Contact.Fields.Telephone1) != entity.lys_phone)
                    {
                        Contact contact = new Contact();
                        contact.Id = entity.lys_contactid.Id;
                        contact.Telephone1 = entity.lys_phone;
                        client.Update(contact);
                    }
                }

                if (entity.lys_main == true && !string.IsNullOrEmpty(entity.lys_email))
                {
                    if (retrievedContact.GetAttributeValue<string>(Contact.Fields.EMailAddress1) != entity.lys_email)
                    {
                        Contact contact = new Contact();
                        contact.Id = entity.lys_contactid.Id;
                        contact.EMailAddress1 = entity.lys_email;
                        client.Update(contact);
                    }
                }
            }
        }

        public static void CreateCommunications(CrmServiceClient client)
        {
            
        }
    }
}