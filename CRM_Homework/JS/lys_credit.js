var Navicon = Navicon || {};

Navicon.lys_credit = (function()
{     

    //Функция проверяет, что дата окончания больше даты начала не менее, чем на год. В ином случае выводит сообщение и блокирует сохранение формы.
    var checkCreditDates = function(context)
    {
        let formContext = context.getFormContext();
        let datestart = new Date(formContext.getAttribute("lys_datestart").getValue());        
        let dateend = new Date(formContext.getAttribute("lys_dateend").getValue());   
        const dateMin = "Thu, 01 Jan 1970 00:00:00 GMT";
        let resultOfCheck;

        if( datestart.toGMTString() !== dateMin && dateend.toGMTString() !== dateMin )
        {           
            if (dateend < datestart.setFullYear(datestart.getFullYear() + 1))
            {
                let alertStrings = { text: "Дата окончания должна быть больше даты начала не менее, чем на год. Сохранение данных формы отключено.", title: "Внимание"};                
                Xrm.Navigation.openAlertDialog(alertStrings);                
                resultOfCheck = false;
            }            
            else
            {
                resultOfCheck = true;
            }
        }
        
        return resultOfCheck;
    }

    return {      
        onLoad : function(context)
        {
            let formContext = context.getFormContext();
            checkCreditDates(context);
            formContext.getAttribute("lys_datestart").addOnChange(checkCreditDates);
            formContext.getAttribute("lys_dateend").addOnChange(checkCreditDates);
        },

        onSave : function(context)
        {            
            if (!checkCreditDates(context))
            {
                let executionContext = context;            
                executionContext.getEventArgs().preventDefault();            
            }
        }
    }
})();