﻿using System;
using Microsoft.Xrm.Sdk;
using Navicon.Common.Entities;
using Navicon.Common.Entities.Handlers;
using Navicon.Common.Plugins;

namespace Navicon.Plugins.Invoice
{
    public class PostNavInvoiceUpdate : BasePlugin
    {
        public override void Execute(IServiceProvider serviceProvider)
        {
            base.Execute(serviceProvider);

            if (PluginExecutionContext.Depth > 1)
            {
                // Recursive update.
                return;
            }

            try
            {
                lys_invoice updatedInvoice = GetTargetAs<Entity>().ToEntity<lys_invoice>();
                IOrganizationService currentUserService = CreateService();

                NavInvoiceHandler invoiceHandler = new NavInvoiceHandler(currentUserService, TraceService);

                // 5.3
                // 5.5.
                invoiceHandler.UpdateRelatedAgreementFactData(updatedInvoice);

                // 5.4
                invoiceHandler.UpdateInvoiceDate(updatedInvoice);

            }
            catch (EntityHandlerException e)
            {
                TraceService.Trace(e.ToString());
                throw new InvalidPluginExecutionException(e.Message);
            }
            catch (Exception e)
            {
                TraceService.Trace(e.ToString());
                throw;
                //throw new InvalidPluginExecutionException(Properties.strings.ErrorMessage);
            }
        }
    }
}