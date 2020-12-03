using System;
using Microsoft.Xrm.Sdk;

namespace Navicon.Common.Plugins
{
    public abstract class BasePlugin : IPlugin
    {
        protected ITracingService TraceService { get; private set; }
        protected IPluginExecutionContext PluginExecutionContext { get; private set; }
        protected IOrganizationServiceFactory ServiceFactory { get; private set; }
        
        public virtual void Execute(IServiceProvider serviceProvider)
        {
            TraceService = (ITracingService) serviceProvider.GetService(typeof(ITracingService));
            PluginExecutionContext = (IPluginExecutionContext) serviceProvider.GetService(typeof(IPluginExecutionContext));
            ServiceFactory = (IOrganizationServiceFactory) serviceProvider.GetService(typeof(IOrganizationServiceFactory));
        }
        
        protected IOrganizationService CreateService(bool useCurrentUser = true)
        {
            return ServiceFactory.CreateOrganizationService(useCurrentUser ? Guid.Empty : (Guid?) null);
        }
        
        public T GetTargetAs<T>() where T : class
        {
            return PluginExecutionContext.InputParameters[StaticData.PluginExecuteTargetName] as T;
        }
    }
}