var Navicon = Navicon || {};

Navicon.nav_building = (function()
{

    var floorOnChange = function (context)
    {
        let formContext = context.getFormContext();
        let floorAttr = formContext.getAttribute("nav_floors");


        let resourceControl = formContext.getControl("WebResource_test").getContentWindow();
        resourceControl.then(function(contentWindow){
            contentWindow.OuterCall(formContext, "Call from form");

        },
        function(error){
            console.log(error.message);

        })


        //createRecord
        //deleteRecord
        //retrieveRecord
        //updateRecord
        //retrieveMultipleRecors
        //execute

        let developersArray = formContext.getAttribute("nav_developerid").getValue();
        let developerRef = developersArray[0];

        var promiseAccount = Xrm.WebApi.retrieveRecord("account", developerRef.id, "?$select=name,ftpsiteurl");
        promiseAccount.then(
            function(accountResult){
                console.log( "name:" + accountResult.name + " ftp:" + accountResult.ftpsiteurl );
                return accountResult.name;
            },
            function(error)
            {
                console.error(error.message);
            }
        ).then(            
            function(name){
                console.log( "name:" + name );

            },
            function(error)
            {
                console.error(error.message);
            }
        );

        let ownerArray = formContext.getAttribute("ownerid").getValue();
        let ownerRef = ownerArray[0];

        var promiseOwner = Xrm.WebApi.retrieveRecord("systemuser", ownerRef.id, "?$select=fullname");

        Xrm.Utility.showProgressIndicator("Loading.....");
        Promise.all([promiseAccount, promiseOwner]).then(
                function(values)
                {
                    console.log( values[1].fullname );
                    Xrm.Utility.showProgressIndicator("Loading.....");
                }
        ).finally(
            function()
            {
                    
                Xrm.Utility.closeProgressIndicator();
            }
        );

        
        Xrm.WebApi.retrieveMultipleRecors("account", "?$select=name&$filter=ownerid/systemuserid eq 'test'" ).then(
            function(entityResult){
                for(var i =0; i < entityResult.entities.length; i++)
                {
                    console.log( entityResult.entities[i].name );

                }

            }

        );

    }
    
    return {

        onLoad : function(context)
        {

            
            let formContext = context.getFormContext();

            let formType = formContext.ui.getFormType();
            if(formType == 1)
            {
                console.log()

            }
        
            let floorAttr = formContext.getAttribute("nav_floors");
            floorAttr.setRequiredLevel("required");
            console.log(  floorAttr.getValue()) ;
        
            floorAttr.addOnChange(   floorOnChange  );


            let floorControl = formContext.getControl("nav_floors");
            floorControl.setDisabled(false);

            let developerId = formContext.getAttribute("nav_developerid").getValue();
            console.log(developerId);
        
        }
    }
})();

 


