using System.Configuration;
using System.Net;

namespace Navicon.ConsoleApp01
{
    static class Configuration
    {
        /// <summary>
        /// Метод получает коллекцию ключей и значений из файла App.config
        /// и возвращает в ввиде строкового значения
        /// </summary>
        /// <returns>Строковое значение Key=Value;Key2=Value2;</returns>
        public static string GetConnectionString()
        {
            var appSettings = ConfigurationManager.AppSettings;
            string connectionString = "";
            foreach (var key in appSettings.AllKeys)
            {
                connectionString = connectionString + $"{key}={appSettings.Get(key)};";
            }

            return connectionString;
        }

        public static string GetLog4NetConfig()
        {
            
            return "";
        }

        /// <summary>
        /// Метод включает TLS 1.2
        /// </summary>
        public static void EnableTLS12()
        {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
        }
    }
}