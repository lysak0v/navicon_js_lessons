using System;
using Microsoft.Xrm.Sdk;
using Navicon.Common.Entities;
using Navicon.Common.Entities.Handlers;
using Navicon.Common.Plugins;

namespace Navicon.Plugins.Communication
{
    public class PostNavCommunicationUpdate : BasePlugin
    {
        public override void Execute(IServiceProvider serviceProvider)
        {
            base.Execute(serviceProvider);

            try
            {
                lys_communication createdCommunication = GetTargetAs<Entity>().ToEntity<lys_communication>();
                IOrganizationService currentUserService = CreateService();

                NavCommunicationHandler communicationHandler = new NavCommunicationHandler(currentUserService, TraceService);

                // 5.6
                communicationHandler.CheckMultipleMainCommunications(createdCommunication);
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