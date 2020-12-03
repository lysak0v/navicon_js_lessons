using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Navicon.Common.Repository;

namespace Navicon.Common.Entities.Handlers
{
    /*
     * Performs operations on lys_communication Entities.
     */
    public class NavCommunicationHandler : EntityHandler
    {
        public NavCommunicationHandler(IOrganizationService service, ITracingService tracingService) : base(service, tracingService)
        {
        }

        /*
         * Checks if there are already present lys_communication with lys_main=true and the same lys_type as provided agreement's.
         * Throws an InvalidPluginExecutionException if duplicates were found, returns otherwise.
         *
         * communication - created/updated lys_communication.
         */
        public void CheckMultipleMainCommunications(lys_communication communication)
        {
            BaseRepository<lys_communication> communicationRepo = new BaseRepository<lys_communication>(Service, lys_communication.EntityLogicalName);

            // Checking if all required communication data is present. If not, obtaining it from CRM.
            if (communication.lys_main == null || communication.lys_type == null || communication.lys_contactid == null)
            {
                communication = communicationRepo.Get(communication.Id, new ColumnSet(lys_communication.Fields.lys_main, lys_communication.Fields.lys_type, lys_communication.Fields.lys_contactid));
            }

            TracingService.Trace($"relatedContactId={communication.lys_contactid}, communicationId={communication.Id}, lys_main={communication.lys_main}, lys_type={communication.lys_type}");

            // No need to check non-set objects.
            if (communication.lys_main == null || communication.lys_main == false || communication.lys_type == null || communication.lys_contactid == null)
            {
                return;
            }

            // Getting all other communications related to our contact with their lys_main=true and the same lys_type.
            QueryExpression query = new QueryExpression();
            query.Criteria.AddCondition(lys_communication.Fields.lys_contactid, ConditionOperator.Equal, communication.lys_contactid.Id);
            query.Criteria.AddCondition(lys_communication.Fields.lys_type, ConditionOperator.Equal, communication.lys_type.Value);
            query.Criteria.AddCondition(lys_communication.Fields.lys_main, ConditionOperator.Equal, true);
            query.Criteria.AddCondition(lys_communication.Fields.lys_communicationId, ConditionOperator.NotEqual, communication.Id);
            query.ColumnSet = new ColumnSet(false);

            query.ColumnSet = new ColumnSet(false);

            EntityCollection ec = communicationRepo.GetMultiple(query);

            TracingService.Trace($"Retrieved lys_communications. ec={ec}, ec.Entities={ec.Entities}, ec.Entities.Count={ec.Entities.Count}");

            if (ec.Entities.Count > 0)
            {
                // Another main communication with the same type is already present.
                throw new EntityHandlerException("Основное средство связи с заданным типом уже существует для связанного контакта.");
            }
        }
    }
}