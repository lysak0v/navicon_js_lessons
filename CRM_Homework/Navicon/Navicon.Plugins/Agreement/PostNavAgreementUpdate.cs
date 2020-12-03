using System;
using Microsoft.Xrm.Sdk;
using Navicon.Common.Entities;
using Navicon.Common.Entities.Handlers;
using Navicon.Common.Plugins;

namespace Navicon.Plugins.Agreement
{
    public class PostNavAgreementUpdate : BasePlugin
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
                lys_agreement updatedAgreement = GetTargetAs<Entity>().ToEntity<lys_agreement>();
                IOrganizationService currentUserService = CreateService();

                NavAgreementHandler agreementHandler = new NavAgreementHandler(currentUserService, TraceService);

                // 5.5 
                agreementHandler.UpdateFact(updatedAgreement);
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