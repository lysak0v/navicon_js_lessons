using System;
using System.Web.UI.WebControls;
using Microsoft.Xrm.Sdk;

namespace Navicon.Plugins.Invoice
{
    public sealed class PreInvoiceCreate : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var traceService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            
            var pluginContext = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var targetInvoice = (Entity) pluginContext.InputParameters["Target"];
            
            var type = targetInvoice.GetAttributeValue<Microsoft.Xrm.Sdk.OptionSetValue>("lys_type");
            traceService.Trace("Получил lys_type");


            if (type == null)
            {
                targetInvoice["lys_type"] = new OptionSetValue(218820000);
                traceService.Trace("Установил значение lys_type = 218820000 (ручное)");

            }

        }
    }
}