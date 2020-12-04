using System;
using System.Activities;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Workflow;
using Navicon.Common.Entities;
using Navicon.Common.Entities.Handlers;
using Navicon.Common.Workflows;

namespace Navicon.Workflows.AgreementActivities
{
    public sealed class AgreementCreateInvoiceActivity : BaseWorkflowActivity
    {
        [ReferenceTarget(lys_agreement.EntityLogicalName)]
        [Input(lys_agreement.EntityLogicalName)]
        [RequiredArgument]
        public InArgument<EntityReference> Agreement { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            Init(context);

            try
            {
                IOrganizationService currentUserService = CreateService();
                NavAgreementHandler agreementHandler = new NavAgreementHandler(currentUserService, TraceService);

                lys_agreement agreement = new lys_agreement
                {
                    Id = Agreement.Get(context).Id
                };

                // 6.1
                agreementHandler.CreateFirstRelatedInvoice(agreement, WorkflowContext.UserId);
            }
            catch (EntityHandlerException e)
            {
                TraceService.Trace(e.ToString());
                throw new InvalidWorkflowException(e.Message);
            }
            catch (Exception e)
            {
                TraceService.Trace(e.ToString());
                throw new InvalidWorkflowException("Возникла ошибка, см. журнал для подробностей.");
            }
        }
    }
}