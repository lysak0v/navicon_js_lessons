using Microsoft.Xrm.Sdk;

namespace Navicon.Common.Entities.Handlers
{
    /*
     * Base class for all CRM Entity handlers.
     */
    public abstract class EntityHandler
    {
        protected IOrganizationService Service { get; }
        protected ITracingService TracingService { get; }

        protected EntityHandler(IOrganizationService service, ITracingService tracingService)
        {
            Service = service;
            TracingService = tracingService;
        }
    }
}