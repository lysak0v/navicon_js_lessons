var Navicon = Navicon || {};

Navicon.lys_auto = (function()
{     

    //Функция отображает/скрывает поле Телефон/E-mail в зависимости от значения поля Тип
    var usedAttrChanged = function(context)
    {
        let formContext = context.getFormContext();
        let usedAttr = formContext.getControl("lys_used");
        let ownerscountControl = formContext.getControl("lys_ownerscount");
        let isdamagedControl = formContext.getControl("lys_isdamaged");
        let kmControl = formContext.getControl("lys_km");       

        if (usedAttr.getValue() == "Да")
        {
            ownerscountControl.setVisible(true);
            isdamagedControl.setVisible(true);
            kmControl.setVisible(true);
        }
        else
        {
            ownerscountControl.setVisible(false);
            isdamagedControl.setVisible(false);
            kmControl.setVisible(false);
        }
    }

    return {      
        onLoad : function(context)
        {
            let formContext = context.getFormContext();
            let ownerscountControl = formContext.getControl("lys_ownerscount");
            let isdamagedControl = formContext.getControl("lys_isdamaged");
            let kmControl = formContext.getControl("lys_km");
            let usedAttr = formContext.getAttribute("lys_used");
             
            ownerscountControl.setVisible(false);
            isdamagedControl.setVisible(false);
            kmControl.setVisible(false);
            usedAttr.addOnChange(usedAttrChanged);               
        }
    }
})();