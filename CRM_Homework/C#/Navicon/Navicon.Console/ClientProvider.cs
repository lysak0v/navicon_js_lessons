using System;
using System.Configuration;
using System.Diagnostics;
using Microsoft.Xrm.Tooling.Connector;

namespace Navicon.Console
{
    /*
     * Handles client connections to Dynamics 365 CRM.
     */
    public class ClientProvider
    {
        /// <summary>
        /// Метод создает CRM клиент
        /// </summary>
        /// <returns>CrmServiceClient</returns>
        public CrmServiceClient Connect()
        {
            
            TraceControlSettings.TraceLevel = SourceLevels.All;
            TraceControlSettings.AddTraceListener(new TextWriterTraceListener("CrmSdkLogs.log"));
            
            CrmServiceClient client = new CrmServiceClient(Configuration.GetConnectionString()); 

            if (client.LastCrmException != null)
            {
                Log.Logger.Error("Не удалось установить соединение с CRM",
                    client.LastCrmException);

                return null;
            }

            Log.Logger.Debug("Соединение с CRM установлено");

            return client;
        }
    }
}