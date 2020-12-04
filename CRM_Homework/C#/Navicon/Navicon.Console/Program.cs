using System;
using System.Linq;
using System.Net;
using System.Configuration;
using System.Collections.Specialized;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Tooling.Connector;
using Navicon.Common.Entities;

namespace Navicon.Console
{
    class Program
    {
        static void Main(string[] args)
        {
            var client = new ClientProvider().Connect();

            if (client == null)
            {
                Log.Logger.Error("Не удалось установить соединение с CRM");
                return;
            }

            #region Task4-2-1

            try
            {
                Log.Logger.Info("Начато обновление контактов");
                EntityHandler.UpdateContacts(client);
                Log.Logger.Info("Обновление контактов завершено");
            }
            catch (Exception e)
            {
                Log.Logger.Error($"Не удалось обновить контакты, исключение:\n{e}");
            }
            
            #endregion

            #region Task4-2-2
            
            try
            {
                Log.Logger.Info("Начато создание средств связи");
                EntityHandler.CreateCommunications(client);
                Log.Logger.Info("Создание средств связи завершено");
            }
            catch (Exception e)
            {
                Log.Logger.Error($"Не удалось создать средства связи, исключение:\n{e}");
            }

            #endregion
            
            System.Console.Write("Работа завершена...");
            System.Console.ReadKey();
        }
    }
}