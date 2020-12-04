var Navicon = Navicon || {};

Navicon.lys_model = (function () {

    //Функция осуществляет проверку, является ли пользователь Системным администраотром
    var isSystemAdministrator = function () {
        let userSettings = Xrm.Utility.getGlobalContext().userSettings;
        let userRoles = userSettings.roles;
        let isAdmin = false;
        userRoles.forEach(role => {
            if (role.name == "Системный администратор"){
                isAdmin = true;
            }
        });
        return isAdmin;
    }

    var getAllAttAttributes = function (context)
    {
        let formContext = context.getFormContext();
        const attrNames = ["ownerid", "lys_name", "lys_brandid", "lys_volume", "lys_year", "lys_kp", "lys_color", "lys_details", "lys_recommendedamount"];
        let attributes = new Array();
        attrNames.forEach(attr => {
            let item = formContext.getAttribute(attr);
            if (item !== null){
                attributes.push(item);
            }
        });
        return attributes;
    }

    var setAllControlsReadOnly = function (context)
    {
        let formContext = context.getFormContext();
        let attributes = getAllAttAttributes(context);
        attributes.forEach(attribute =>
        {
            attribute.controls.forEach(control => {
                control.setDisabled(true)
            });
        })
    }

    return {
        onLoad: function (context) {
            let formContext = context.getFormContext();
            let isAdmin = isSystemAdministrator();

            if (!isAdmin)
            {
                setAllControlsReadOnly(context);
            }
        }
    }
})();