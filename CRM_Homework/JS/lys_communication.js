var Navicon = Navicon || {};

Navicon.lys_communication = (function()
{     

    //Функция отображает/скрывает поле Телефон/E-mail в зависимости от значения поля Тип
    var typeAttrOnChange = function(context)
    {
        let formContext = context.getFormContext();
        let phoneControl = formContext.getControl("lys_phone");
        let emailControl = formContext.getControl("lys_email");
        let typeAttr = formContext.getAttribute("lys_type");        
            

        switch (typeAttr.getValue()) {
            case 218820001:
                phoneControl.setVisible(true);
                emailControl.setVisible(false);
                break;
            case 218820002:
                phoneControl.setVisible(false);
                emailControl.setVisible(true);
                break;
            default:
                phoneControl.setVisible(false);
                emailControl.setVisible(false);
                break;
        }
        
    }

    return {      
        onLoad : function(context)
        {
            let formContext = context.getFormContext();
            let formType = formContext.ui.getFormType();            
            let phoneControl = formContext.getControl("lys_phone");
            let emailControl = formContext.getControl("lys_email");
            let typeAttr = formContext.getAttribute("lys_type");

            //Форма создания средства связи
            if (formType == 1)
            {                               
                phoneControl.setVisible(false);
                emailControl.setVisible(false);
                typeAttr.addOnChange(typeAttrOnChange);                
            }            
        }
    }
})();