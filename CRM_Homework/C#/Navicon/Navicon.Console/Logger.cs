using log4net;
using log4net.Config;

namespace Navicon.Console
{
    public static class Log
    {
        public static ILog Logger { get; }

        static Log()
        {
            XmlConfigurator.Configure();
            Logger = LogManager.GetLogger("Logger");
        }
    }
}