var Navicon = Navicon || {};

Navicon.lys_agreement = (function()
{

    //Функция отображает поле "Кредитная программа", если поле "Автомобиль" и "Контакт" заполнено
    var changeCreditControlVisibility = function(context)
    {
        let formContext = context.getFormContext();
        let autoAttr = formContext.getAttribute("lys_autoid");
        let contactAttr = formContext.getAttribute("lys_contact");        
        let creditidControl = formContext.getControl("lys_creditid");                
        if((autoAttr.getValue() !== null) && (contactAttr.getValue() !== null))
        {                        
            creditidControl.setVisible(true);
        }
        else
        {
            creditidControl.setVisible(false);
        }                    
    }

    //Функция отображает вкладку "Кредит", если поле "Кредитная программа" заполнено
    var changeCreditTabVisibility = function(context)
    {
        let formContext = context.getFormContext();
        let creditidAttr = formContext.getAttribute("lys_creditid");
        if(creditidAttr.getValue() !== null)
        {
            formContext.ui.tabs.get("tab_2").setVisible(true);
        }
        else
        {
            formContext.ui.tabs.get("tab_2").setVisible(false);
        }
        
    }

    //Функция удаляет из поля "Номер договора" все кроме цифр и тире
    var changeAgreementName = function(context)
    {
        let formContext = context.getFormContext();
        let agreementNameAttr = formContext.getAttribute("lys_name");
        
        if(agreementNameAttr.getValue() !== null)
        {
            let newValue = agreementNameAttr.getValue();
            newValue = newValue.replace(/[^\d-]/g, '');           
            agreementNameAttr.setValue(newValue);
            agreementNameAttr.fireOnChange();
        }
    }

    //Функция отображает нативный для CRM Alert, принимает текст сообщения и заголовок
    var showAlert = function (text, title)
    {
        if ( text !== null && text !== "" && title !== null && title !== "")
        {
            let alertStrings =
                {
                    text: `${text}`, title: `${title}`
                };
            Xrm.Navigation.openAlertDialog(alertStrings);
        }
    }

    //Функция сравнивает датe договора c датой окончания кредитной программы, если кредитная программа истекла или возникла ошибка - возвращается true
    var isCreditExpired = function (context) {
        let formContext = context.getFormContext();
        let isExpired = false;
        let agreementCreditIdAttrValue = formContext.getAttribute("lys_creditid").getValue();
        let agreementDate = formContext.getAttribute("lys_date").getValue();

        if (agreementCreditIdAttrValue !== null && agreementDate !== null)
        {
            let retrieveCreditById = Xrm.WebApi.retrieveRecord(agreementCreditIdAttrValue[0].entityType, agreementCreditIdAttrValue[0].id);
            retrieveCreditById.then(
                function (retrievedCredit)
                {
                    if (retrievedCredit.lys_datestart !== null && retrievedCredit.lys_dateend !== null &&
                        retrievedCredit.lys_datestart !== "" && retrievedCredit.lys_dateend !== "")
                    {
                        let creditDateStart = new Date(retrievedCredit.lys_datestart);
                        let creditDateEnd = new Date(retrievedCredit.lys_dateend);
                        agreementDate = new Date(agreementDate);

                        if ( agreementDate < creditDateStart || agreementDate > creditDateEnd )
                        {
                            showAlert("Дата договора не входит в период действия кредитной программы", "Ошибка");
                            isExpired = true;
                        }
                    }
                    else
                    {
                        showAlert("Проверьте дату начала и конца кредитной программы", "Ошибка");
                    }
                },
                function (error)
                {
                    showAlert(`Ошибка получения экземпляра сущности lys_credit в функции isCreditExpired\n${error}`, "Ошибка");
                }
            )
        }
        return isExpired;
    }

    var setAgreementCreditPeriod = function (context)
    {
        let formContext = context.getFormContext();
        let agreementCreditIdAttributeValue = formContext.getAttribute("lys_creditid").getValue();
        let agreementCreditPeriodAttribute = formContext.getAttribute("lys_creditperiod");

        if (agreementCreditIdAttributeValue !== null && agreementCreditPeriodAttribute !== null)
        {
            let retrieveCreditById = Xrm.WebApi.retrieveRecord(agreementCreditIdAttributeValue[0].entityType, agreementCreditIdAttributeValue[0].id);
            retrieveCreditById.then(
                function (retrievedCredit)
                {
                    if ( retrievedCredit.lys_creditperiod !== null && retrievedCredit.lys_creditperiod !== "")
                    {
                        let creditPeriod = retrievedCredit.lys_creditperiod;
                        agreementCreditPeriodAttribute.setValue(creditPeriod);
                        agreementCreditPeriodAttribute.fireOnChange();
                    }
                    else
                    {
                        showAlert("Проверьте срок кредита в выбранной кредитной программе", "Ошибка");
                    }
                },
                function (error)
                {
                    showAlert(`Ошибка получения экземпляра сущности lys_credit в функции setAgreementCreditPeriod\n${error}`, "Ошибка");

                }
            )
        }

    }

    //Функция устанавливает сумму договора равной сумме автомобиля, если он новый. Если б/у - сумма берется из сущности модель
    var setAgreementSumm = function (context) {
        let formContext = context.getFormContext();
        let agreementAutoIdAttrValue = formContext.getAttribute("lys_autoid").getValue();
        let agreementSummAttr = formContext.getAttribute("lys_summ");

        if (agreementAutoIdAttrValue !== null && agreementSummAttr !== null)
        {
            let auto;
            let retrieveModelById;

            let retrieveAutoById = Xrm.WebApi.retrieveRecord(agreementAutoIdAttrValue[0].entityType, agreementAutoIdAttrValue[0].id);
            retrieveAutoById.then(
                function (retrievedAuto)
                {
                    if (retrievedAuto !== null)
                    {
                        auto = retrievedAuto;
                        retrieveModelById = Xrm.WebApi.retrieveRecord("lys_model", auto._lys_modelid_value);
                    }
                },
                function (error)
                {
                    showAlert(`Ошибка получения экземпляра сущности lys_auto в функции setAgreementSumm\n${error}`, "Ошибка");
                }
            ).then(
                function ()
                {
                    retrieveModelById.then(
                        function (retrievedModel)
                        {
                            if (retrievedModel !== null)
                            {
                                if ( auto.lys_used)
                                {
                                    agreementSummAttr.setValue(auto.lys_amount);
                                    agreementSummAttr.fireOnChange();
                                }
                                else
                                {
                                    agreementSummAttr.setValue(retrievedModel.lys_recommendedamount);
                                    agreementSummAttr.fireOnChange();
                                }
                            }
                        },
                        function (error)
                        {
                            showAlert(`Ошибка получения экземпляра сущности lys_model в функции setAgreementSumm\n${error}`, "Ошибка");
                        }
                    )
                }
            )
        }
        else
        {
            agreementSummAttr.setValue(0);
            agreementSummAttr.fireOnChange();
        }

    }

    return {      
        onLoad : function(context)
        {
            let formContext = context.getFormContext();
            let agreementFormType = formContext.ui.getFormType();
            let agreementFactControl = formContext.getControl("lys_fact");
            let agreementCreditIdControl = formContext.getControl("lys_creditid");
            let agreementCreditIdAttr = formContext.getAttribute("lys_creditid");
            let agreementDateAttr = formContext.getAttribute("lys_date");
            let agreementAutoIdAttr = formContext.getAttribute("lys_autoid");



            //Проверка не истекла ли кредитная программа по событию изменения атрибута кредитной программы или смены даты договора
            agreementCreditIdAttr.addOnChange(isCreditExpired);
            agreementDateAttr.addOnChange(isCreditExpired);
            //Функция получает срок кредита из выбранной кредитной программы и устанавливает его в поле "срок кредита" сущности "договор"
            agreementCreditIdAttr.addOnChange(setAgreementCreditPeriod);
            //Функция указывает сумму договора из сущности авто, если б/у или из модели, если не б/у
            agreementAutoIdAttr.addOnChange(setAgreementSumm);

            //Форма создания договора
            if(agreementFormType == 1)
            {                               
                agreementFactControl.setVisible(false);
                agreementCreditIdControl.setVisible(false);
                formContext.ui.tabs.get("tab_2").setVisible(false); 
                formContext.getAttribute("lys_autoid").addOnChange(changeCreditControlVisibility);
                formContext.getAttribute("lys_contact").addOnChange(changeCreditControlVisibility);
                agreementCreditIdAttr.addOnChange(changeCreditTabVisibility);
                formContext.getAttribute("lys_name").addOnChange(changeAgreementName);                              
                
            }            
        },

        onSave : function (context)
        {
            if (isCreditExpired(context))
            {
                let executionContext = context;
                executionContext.getEventArgs().preventDefault();
            }
        }
    }
})();