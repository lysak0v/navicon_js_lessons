using System;
using Microsoft.Xrm.Sdk;
using Navicon.Common.Entities;
using Navicon.Common.Entities.Handlers;
using Navicon.Common.Plugins;

namespace Navicon.Plugins.Invoice
{
    public class PreNavInvoiceCreate : BasePlugin
    {
        public override void Execute(IServiceProvider serviceProvider)
        {
            base.Execute(serviceProvider);

            try
            {
                lys_invoice createdInvoice = GetTargetAs<Entity>().ToEntity<lys_invoice>();
                IOrganizationService currentUserService = CreateService();

                // 5.1
                if (createdInvoice.lys_type == null)
                {
                    createdInvoice.lys_type = lys_invoice_lys_type.Ruchnoe_sozdanie;
                }

                NavInvoiceHandler invoiceHandler = new NavInvoiceHandler(currentUserService, TraceService);

                // 5.4
                invoiceHandler.UpdateInvoiceDate(createdInvoice, true);
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