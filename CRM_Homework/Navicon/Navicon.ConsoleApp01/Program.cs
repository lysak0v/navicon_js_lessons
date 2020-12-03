using System;
using System.Linq;
using System.Net;
using System.Configuration;
using System.Collections.Specialized;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Tooling.Connector;
using Navicon.ConsoleApp01.Entities;

namespace Navicon.ConsoleApp01
{
    class Program
    {
        static void Main(string[] args)
        {
            var connectionString = Configuration.GetConnectionString();
            Configuration.EnableTLS12();
            
            CrmServiceClient client = new CrmServiceClient(connectionString);
            var service = (IOrganizationService) client;

            //Задача 4.2.1
            #region Task4-2-1

            QueryExpression queryTask1 = new QueryExpression(lys_communication.EntityLogicalName);
            queryTask1.ColumnSet = new ColumnSet(true);
            queryTask1.NoLock = true;
            queryTask1.Criteria.AddCondition(lys_communication.Fields.lys_main, ConditionOperator.Equal, true);

            try
            {
                var retrieveResult = service.RetrieveMultiple(queryTask1);
                var entities = retrieveResult.Entities.Select(e => e.ToEntity<lys_communication>());
                foreach (var entity in entities)
                {
                    var retrievedContact = service.Retrieve(Contact.EntityLogicalName, entity.lys_contactid.Id,
                        new ColumnSet(Contact.Fields.EMailAddress1, Contact.Fields.Telephone1));
                    
                    if (entity.lys_main == true && !string.IsNullOrEmpty(entity.lys_phone))
                    {
                        if (retrievedContact.GetAttributeValue<string>(Contact.Fields.Telephone1) != entity.lys_phone)
                        {
                            Contact contact = new Contact();
                            contact.Id = entity.lys_contactid.Id;
                            contact.Telephone1 = entity.lys_phone;
                            service.Update(contact);
                        }
                    }
                    
                    if (entity.lys_main == true && !string.IsNullOrEmpty(entity.lys_email))
                    {
                        if (retrievedContact.GetAttributeValue<string>(Contact.Fields.EMailAddress1) != entity.lys_email)
                        {
                            Contact contact = new Contact();
                            contact.Id = entity.lys_contactid.Id;
                            contact.EMailAddress1 = entity.lys_email;
                            service.Update(contact);    
                        }
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;    
            }
            
            #endregion

            //Задача 4.2.2
            #region Task4-2-2

            QueryExpression queryTask2 = new QueryExpression(Contact.EntityLogicalName);
            queryTask2.ColumnSet = new ColumnSet(true);
            queryTask2.NoLock = true;
            queryTask2.Criteria.AddCondition(Contact.Fields.FullName, ConditionOperator.NotNull);

            try
            {
                var retrieveResult = service.RetrieveMultiple(queryTask2);
                var entities = retrieveResult.Entities.Select(e => e.ToEntity<Contact>());
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
            

            #endregion
            
            Console.Write("Press any key for exit...");
            Console.ReadKey();
        }
    }
}