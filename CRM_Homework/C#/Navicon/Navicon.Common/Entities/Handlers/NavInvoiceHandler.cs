using System;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Navicon.Common.Repository;

namespace Navicon.Common.Entities.Handlers
{
    /*
     * Performs operations on lys_invoice Entities.
     */
    public class NavInvoiceHandler : EntityHandler
    {
        public NavInvoiceHandler(IOrganizationService service, ITracingService tracingService) : base(service, tracingService)
        {
        }

        /*
         * Updates lys_fact and lys_factsum fields of invoice's related agreement based on all it's related paid invoices.
         *
         * invoice - lys_invoice;
         * invoicesToExclude - IDs of lys_invoices to exclude from the related invoices list.
         *
         * Returns true if updated, false otherwise.
         */
        public bool UpdateRelatedAgreementFactData(lys_invoice invoice, params Guid[] invoicesToExclude)
        {
            Guid relatedAgreementId;
            BaseRepository<lys_invoice> invoiceRepo = new BaseRepository<lys_invoice>(Service, lys_invoice.EntityLogicalName);
            BaseRepository<lys_agreement> agreementRepo = new BaseRepository<lys_agreement>(Service, lys_agreement.EntityLogicalName);

            // Checking if invoice contains related agreement ID. If not, obtaining it from CRM.)
            if (invoice.lys_dogovorid != null)
            {
                relatedAgreementId = invoice.lys_dogovorid.Id;
            }
            else
            {
                relatedAgreementId = invoiceRepo.Get(invoice.Id, new ColumnSet(lys_invoice.Fields.lys_dogovorid)).lys_dogovorid.Id;
            }

            TracingService.Trace($"relatedAgreementId={relatedAgreementId}");

            // Obtaining related agreement sum from CRM.
            lys_agreement relatedAgreement = agreementRepo.Get(relatedAgreementId, new ColumnSet(lys_agreement.Fields.lys_summ));

            // Getting total paid invoices sum.
            Decimal totalPaidInvoiceSum = GetRelatedNavInvoicesSum(relatedAgreementId, invoicesToExclude);

            relatedAgreement.lys_factsumma = new Money(totalPaidInvoiceSum);
            relatedAgreement.lys_fact = relatedAgreement.lys_summ.Value == totalPaidInvoiceSum;

            // Updating related agreement.
            agreementRepo.Update(relatedAgreement);

            TracingService.Trace($"Updated agreement with ID={relatedAgreementId}, totalPaidInvoiceSum={totalPaidInvoiceSum}, lys_fact={relatedAgreement.lys_fact}.");

            return true;
        }

        /*
         * Validates sum of all related agreement's paid invoices and updates invoice's lys_paydate on success.
         *
         * invoice - lys_invoice;
         * skipDbUpdate - if true, then no data will be written to DB.
         */
        public void UpdateInvoiceDate(lys_invoice invoice, bool skipDbUpdate = false)
        {
            if (!ValidateRelatedAgreementInvoicesSum(invoice))
            {
                throw new EntityHandlerException("Сумма созданных счетов превышает сумму связанного договора.");
            }

            TracingService.Trace("invoices sum validated, setting lys_paydate to current DateTime.");

            invoice.lys_paydate = DateTime.Now;

            if (skipDbUpdate) return;

            BaseRepository<lys_invoice> invoiceRepo = new BaseRepository<lys_invoice>(Service, lys_invoice.EntityLogicalName);
            invoiceRepo.Update(invoice);

            TracingService.Trace($"Updated invoice with ID={invoice.Id} in DB.");
        }

        /*
         * Checks if sum of all related agreement's paid invoices is bigger than it's own sum.
         *
         * invoice - lys_invoice.
         *
         * Returns true if sum of all related agreement's paid invoices <= agreement sum; false otherwise.
         */
        private bool ValidateRelatedAgreementInvoicesSum(lys_invoice invoice)
        {
            lys_agreement relatedAgreement = new lys_agreement();
            BaseRepository<lys_invoice> invoiceRepo = new BaseRepository<lys_invoice>(Service, lys_invoice.EntityLogicalName);

            // Checking if invoice contains related agreement ID. If not, obtaining it from CRM.
            if (invoice.lys_dogovorid != null)
            {
                relatedAgreement.Id = invoice.lys_dogovorid.Id;
            }
            else
            {
                relatedAgreement.Id = invoiceRepo.Get(invoice.Id, new ColumnSet(lys_invoice.Fields.lys_dogovorid)).lys_dogovorid.Id;
            }

            // Getting related agreement sum.
            BaseRepository<lys_agreement> agreementRepo = new BaseRepository<lys_agreement>(Service, lys_agreement.EntityLogicalName);
            relatedAgreement = agreementRepo.Get(relatedAgreement.Id, new ColumnSet(lys_agreement.Fields.lys_summ));

            TracingService.Trace($"relatedAgreementId={relatedAgreement.Id}, invoiceId={invoice.Id}");

            // Getting related paid invoices sum.
            Decimal totalPaidInvoiceSum = GetRelatedNavInvoicesSum(relatedAgreement.Id);

            return totalPaidInvoiceSum <= relatedAgreement.lys_summ.Value;
        }

        /*
         * Retrieves sum of all agreement's related paid invoices.
         *
         * agreementId - GUID of lys_agreementl;
         * invoicesToExclude - IDs of lys_invoices to exclude from the related invoices list.
         *
         * returns sum of all agreement's related paid invoices lys_amounts.
         */
        private Decimal GetRelatedNavInvoicesSum(Guid agreementId, params Guid[] invoicesToExclude)
        {
            QueryExpression query = new QueryExpression();
            query.EntityName = lys_invoice.EntityLogicalName;
            query.Criteria.AddCondition(lys_invoice.Fields.lys_dogovorid, ConditionOperator.Equal, agreementId);
            query.Criteria.AddCondition(lys_invoice.Fields.lys_fact, ConditionOperator.Equal, true);

            foreach (Guid guid in invoicesToExclude)
            {
                query.Criteria.AddCondition(lys_invoice.Fields.lys_invoiceId, ConditionOperator.NotEqual, guid);
            }

            query.ColumnSet = new ColumnSet(lys_invoice.Fields.lys_amount);

            BaseRepository<Entity> entitiesRepo = new BaseRepository<Entity>(Service, lys_invoice.EntityLogicalName);
            EntityCollection ec = entitiesRepo.GetMultiple(query);

            TracingService.Trace($"Retrieved lys_invoices. ec={ec}, ec.Entities={ec.Entities}, ec.Entities.Count={ec.Entities.Count}");

            decimal totalInvoiceAmount = 0M;

            foreach (Entity invoice in ec.Entities)
            {
                totalInvoiceAmount += invoice.GetAttributeValue<Money>(lys_invoice.Fields.lys_amount).Value;
            }

            return totalInvoiceAmount;
        }
    }
}