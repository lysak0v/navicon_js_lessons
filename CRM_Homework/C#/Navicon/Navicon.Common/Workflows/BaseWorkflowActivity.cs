﻿using System;
using System.Activities;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Workflow;

namespace Navicon.Common.Workflows
{
    public abstract class BaseWorkflowActivity : CodeActivity
    {
        protected IWorkflowContext WorkflowContext { get; private set; }
        protected ITracingService TraceService { get; private set; }
        protected IOrganizationServiceFactory ServiceFactory { get; private set; }
        
        
        protected void Init(CodeActivityContext context)
        {
            WorkflowContext = context.GetExtension<IWorkflowContext>();
            TraceService = context.GetExtension<ITracingService>();
            ServiceFactory = context.GetExtension<IOrganizationServiceFactory>();
        }

        
        protected IOrganizationService CreateService(bool useCurrentUser = true)
        {
            return ServiceFactory.CreateOrganizationService(useCurrentUser ? Guid.Empty : (Guid?) null);
        }
    }
}