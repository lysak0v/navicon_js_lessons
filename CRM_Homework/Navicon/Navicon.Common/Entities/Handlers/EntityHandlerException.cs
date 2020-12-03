using System;

namespace Navicon.Common.Entities.Handlers
{
    /*
     * Exception class used by all EntityHandlers.
     */
    public class EntityHandlerException : Exception
    {
        public EntityHandlerException(string message) : base(message)
        {
        }

        public EntityHandlerException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}