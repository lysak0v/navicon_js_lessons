using System;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Navicon.Common.Entities;
using Navicon.Common.Repository;

namespace Navicon.Common.Entities.Handlers
{
    /*
     * Performs operations on lys_agreement Entities.
     */
    public class NavAgreementHandler : EntityHandler
    {
        public NavAgreementHandler(IOrganizationService service, ITracingService tracingService) : base(service, tracingService)
        {
        }

        /*
         * Sets related contact's first agreement date to this agreement's date if there were no previously related agreements for this contact.
         *
         * agreement - created lys_agreement.
         *
         * Returns true if updated, false otherwise.
         */
        public bool UpdateRelatedContactDateOnCreate(lys_agreement agreement)
        {
            BaseRepository<lys_agreement> agreementRepo = new BaseRepository<lys_agreement>(Service, lys_agreement.EntityLogicalName);

            // Checking if there are already existing related agreements.
            QueryExpression query = new QueryExpression
            {
                ColumnSet = new ColumnSet(false),
                TopCount = 1
            };
            query.Criteria.AddCondition(lys_agreement.Fields.lys_contact, ConditionOperator.Equal, agreement.lys_contact.Id);

            if (agreementRepo.GetMultiple(query).Entities.Count < 1)
            {
                // Updating contact's date since this is their first related agreement.
                BaseRepository<Contact> contactRepo = new BaseRepository<Contact>(Service, Contact.EntityLogicalName);
                contactRepo.Update(new Contact
                {
                    Id = agreement.lys_contact.Id,
                    lys_date = ((DateTime)agreement.lys_date).AddDays(1)
                });

                return true;
            }

            return false;
        }

        /*
         * Updates lys_fact based on agreement's lys_summ and lys_factsumma values.
         *
         * agreement - lys_agreement to update;
         * skipDbUpdate - if true, then no data will be written to DB.
         */
        public void UpdateFact(lys_agreement agreement, bool skipDbUpdate = false)
        {
            BaseRepository<lys_agreement> agreementRepo = new BaseRepository<lys_agreement>(Service, lys_agreement.EntityLogicalName);

            // Checking if agreement contains required sum data. If not, obtaining it from CRM.
            if (agreement.lys_summ == null || agreement.lys_factsumma == null)
            {
                agreement = agreementRepo.Get(agreement.Id, new ColumnSet(lys_agreement.Fields.lys_summ, lys_agreement.Fields.lys_factsumma));
            }

            TracingService.Trace($"agreementId={agreement.Id}");

            agreement.lys_fact = Equals(agreement.lys_summ, agreement.lys_factsumma);

            if (skipDbUpdate) return;

            agreementRepo.Update(agreement);
            TracingService.Trace($"agreementId={agreement.Id} updated in DB.");
        }

        /*
         * Creates new related lys_invoice if there are no other related invoices for the agreement.
         *
         * agreement - lys_agreement.
         */
        public void CreateFirstRelatedInvoice(lys_agreement agreement, Guid emailNotificationSenderId)
        {
            TracingService.Trace($"agreementId={agreement.Id}");

            if (HasRelatedInvoices(agreement))
            {
                return;
            }

            // Checking if agreement contains required data. If not, obtaining it from CRM.
            if (agreement.lys_name == null || agreement.lys_summ == null || agreement.lys_contact == null)
            {
                BaseRepository<lys_agreement> agreementRepo = new BaseRepository<lys_agreement>(Service, lys_agreement.EntityLogicalName);
                agreement = agreementRepo.Get(agreement.Id, new ColumnSet(lys_agreement.Fields.lys_name, lys_agreement.Fields.lys_summ, lys_agreement.Fields.lys_contact));
            }

            // Creating new invoice.
            lys_invoice newRelatedInvoice = new lys_invoice();
            newRelatedInvoice.lys_name = string.Format("Счет для договора {0}", agreement.lys_name);
            newRelatedInvoice.lys_paydate = newRelatedInvoice.lys_date = DateTime.Now;
            newRelatedInvoice.lys_dogovorid = new EntityReference(lys_agreement.EntityLogicalName, agreement.Id);
            newRelatedInvoice.lys_fact = false;
            newRelatedInvoice.lys_type = lys_invoice_lys_type.Avtomaticheskoe_sozdanie;
            newRelatedInvoice.lys_amount = agreement.lys_summ;

            BaseRepository<lys_invoice> invoiceRepo = new BaseRepository<lys_invoice>(Service, lys_invoice.EntityLogicalName);
            Guid createdInvoiceId = invoiceRepo.Insert(newRelatedInvoice);

            TracingService.Trace($"Created new related lys_invoice with ID={createdInvoiceId} for agreementId={agreement.Id}");

            // Getting agreement's related contact.
            BaseRepository<Contact> contactRepo = new BaseRepository<Contact>(Service, Contact.EntityLogicalName);
            Contact relatedContact = contactRepo.Get(agreement.lys_contact.Id, new ColumnSet(Contact.Fields.FullName, Contact.Fields.EMailAddress1, Contact.Fields.DoNotBulkEMail));

            // Sending email to related contact if they hasn't opted out of emails and their email address is set.
            if (relatedContact.DoNotBulkEMail.HasValue && !relatedContact.DoNotBulkEMail.Value && relatedContact.EMailAddress1 != null)
            {
                // Forming Email message.
                ActivityParty senderParty = new ActivityParty();
                senderParty.PartyId = new EntityReference(SystemUser.EntityLogicalName, emailNotificationSenderId);

                ActivityParty receiverParty = new ActivityParty();
                receiverParty.PartyId = new EntityReference(Contact.EntityLogicalName, relatedContact.Id);

                Email emailMessage = new Email();
                emailMessage.Subject = string.Format("Вам выставлен счет для оплаты договора {0}", agreement.lys_name);
                emailMessage.From = new[] {senderParty};
                emailMessage.To = new[] {receiverParty};
                emailMessage.Description = string.Format("Уважаемый(ая) {0}, по вашему договору {1} выставлен счет на сумму {2}.", relatedContact.FullName, agreement.lys_name, agreement.lys_summ.Value.ToString("0.##"));

                // Sending Email.
                SendEmailRequest emailRequest = new SendEmailRequest();
                emailRequest.EmailId = Service.Create(emailMessage); // Creating Email Entity and getting its ID
                emailRequest.IssueSend = true; // Actually sending the email.
                emailRequest.TrackingToken = "";

                Service.Execute(emailRequest);

                TracingService.Trace($"Sent notification email to related contact with ID={relatedContact.Id} at email={relatedContact.EMailAddress1}");
            }
        }
        
        public void CreateRelatedCreditInvoices(lys_agreement agreement)
        {
            TracingService.Trace($"agreementId={agreement.Id}");

            BaseRepository<lys_agreement> agreementRepo = new BaseRepository<lys_agreement>(Service, lys_agreement.EntityLogicalName);
            BaseRepository<lys_invoice> invoiceRepo = new BaseRepository<lys_invoice>(Service, lys_invoice.EntityLogicalName);

            // Retrieving all related invoices.
            QueryExpression query = new QueryExpression();
            query.ColumnSet = new ColumnSet(lys_invoice.Fields.lys_type, lys_invoice.Fields.lys_fact);
            query.Criteria.AddCondition(lys_invoice.Fields.lys_dogovorid, ConditionOperator.Equal, agreement.Id);

            EntityCollection relatedInvoices = invoiceRepo.GetMultiple(query);

            TracingService.Trace($"[lys_invoices] ec={relatedInvoices}, ec.Entities={relatedInvoices.Entities}, ec.Entities.Count={relatedInvoices.Entities.Count}");

            // Checking if there are any paid or manually created related invoices.
            foreach (Entity entity in relatedInvoices.Entities)
            {
                lys_invoice invoice = (lys_invoice) entity;

                if (invoice.lys_fact == true || invoice.lys_type == lys_invoice_lys_type.Ruchnoe_sozdanie)
                {
                    return;
                }
            }

            // Checking if agreement contains required data. If not, obtaining it from CRM.
            if (agreement.lys_creditid == null || agreement.lys_creditperiod == null || agreement.lys_creditamount == null || agreement.lys_name == null)
            {
                agreement = agreementRepo.Get(agreement.Id, new ColumnSet(lys_agreement.Fields.lys_creditid, lys_agreement.Fields.lys_creditperiod, lys_agreement.Fields.lys_creditamount, lys_agreement.Fields.lys_name));

                // Checking if agreement has all required optional fields set.
                if (agreement.lys_creditid == null || agreement.lys_creditperiod == null || agreement.lys_creditamount == null) return;
            }

            // Deleting all existing automatically created related invoices. 
            foreach (Entity entity in relatedInvoices.Entities)
            {
                invoiceRepo.Delete(entity.Id);
            }

            // Creating new related invoices based on the credit information.
            int creditPeriodMonths = agreement.lys_creditperiod.Value * 12;
            Decimal monthlyCreditAmount = agreement.lys_creditamount.Value / creditPeriodMonths;
            DateTime nextInvoiceDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).AddMonths(1);

            for (int i = 0; i < creditPeriodMonths; ++i)
            {
                lys_invoice newRelatedInvoice = new lys_invoice();
                newRelatedInvoice.lys_name = string.Format("Кредитный счет #{0} для договора {1}", i + 1, agreement.lys_name);
                newRelatedInvoice.lys_date = nextInvoiceDate;
                newRelatedInvoice.lys_paydate = newRelatedInvoice.lys_date;
                newRelatedInvoice.lys_dogovorid = agreement.ToEntityReference();
                newRelatedInvoice.lys_fact = false;
                newRelatedInvoice.lys_type = lys_invoice_lys_type.Avtomaticheskoe_sozdanie;
                newRelatedInvoice.lys_amount = new Money(monthlyCreditAmount);

                invoiceRepo.Insert(newRelatedInvoice);

                nextInvoiceDate = nextInvoiceDate.AddMonths(1);
            }

            // Updating agreement's payment plan date.
            lys_agreement agreementToUpdate = new lys_agreement();
            agreementToUpdate.Id = agreement.Id;
            agreementToUpdate.lys_paymentplandate = DateTime.Now.AddDays(1);

            agreementRepo.Update(agreementToUpdate);

            TracingService.Trace($"Created {creditPeriodMonths} new lys_invoices related to lys_agreement with ID={agreement.Id}");
        }

        /*
         * Checks if agreement has related lys_invoices.
         *
         * agreement - lys_agreement.
         *
         * Returns true if there is at least one related agreement, false otherwise.
         */
        private bool HasRelatedInvoices(lys_agreement agreement)
        {
            TracingService.Trace($"agreementId={agreement.Id}");

            BaseRepository<lys_invoice> invoiceRepo = new BaseRepository<lys_invoice>(Service, lys_invoice.EntityLogicalName);

            // Retrieving the first related lys_invoice.
            QueryExpression query = new QueryExpression();
            query.Criteria.AddCondition(lys_invoice.Fields.lys_dogovorid, ConditionOperator.Equal, agreement.Id);
            query.ColumnSet = new ColumnSet(false);
            query.TopCount = 1;

            EntityCollection ec = invoiceRepo.GetMultiple(query);

            TracingService.Trace($"ec={ec}, ec.Entities={ec.Entities}, ec.Entities.Count={ec.Entities.Count}");

            return ec.Entities.Count > 0;
        }
    }
}