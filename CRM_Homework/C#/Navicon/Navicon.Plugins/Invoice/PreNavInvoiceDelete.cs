using System;
using Microsoft.Xrm.Sdk;
using Navicon.Common.Entities;
using Navicon.Common.Entities.Handlers;
using Navicon.Common.Plugins;

namespace Navicon.Plugins.Invoice
{
    public class PreNavInvoiceDelete : BasePlugin
    {
        public override void Execute(IServiceProvider serviceProvider)
        {
            base.Execute(serviceProvider);

            try
            {
                EntityReference deletedInvoiceRef = GetTargetAs<EntityReference>();
                lys_invoice deletedInvoice = new lys_invoice
                {
                    Id = deletedInvoiceRef.Id
                };
                IOrganizationService currentUserService = CreateService();

                NavInvoiceHandler invoiceHandler = new NavInvoiceHandler(currentUserService, TraceService);

                // 5.3
                // 5.5
                invoiceHandler.UpdateRelatedAgreementFactData(deletedInvoice, deletedInvoice.Id);
            }
            catch (EntityHandlerException e)
            {
                TraceService.Trace(e.ToString());
                throw new InvalidPluginExecutionException(e.Message);
            }
            catch (Exception e)
            {
                TraceService.Trace(e.ToString());
                throw new InvalidPluginExecutionException("Возникла ошибка, см. журнал для подробностей.");
            }
        }
    }
}