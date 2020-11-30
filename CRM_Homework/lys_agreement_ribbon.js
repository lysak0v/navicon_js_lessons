var Navicon = Navicon || {};

Navicon.lys_agreement_ribbon = (function()
{

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

    return {      
        RecalculateCredit : function(context)
        {
            let formContext = context;
            let agreementSum = formContext.getAttribute("lys_summ");
            let agreementInitialFee = formContext.getAttribute("lys_initialfee");
            let agreementCreditAmount = formContext.getAttribute("lys_creditamount");
            let agreementFullCreditAmount = formContext.getAttribute("lys_fullcreditamount");
            let agreementCreditPeriod = formContext.getAttribute("lys_creditperiod");
            let agreementCreditId = formContext.getAttribute("lys_creditid");
            let retrieveCreditById;

            if (agreementCreditAmount !== null && agreementSum !== null && agreementInitialFee !== null)
            {
                agreementCreditAmount.setValue(agreementSum.getValue() - agreementInitialFee.getValue());
                agreementCreditAmount.fireOnChange();
            }
            else
            {
                showAlert(`Проверьте сумму кредита, сумму договора, первоначальный взнос\n${error}`, "Ошибка");
            }

            if (agreementCreditId !== null && agreementFullCreditAmount !== null && agreementCreditPeriod !== null && agreementCreditAmount !== null)
            {
                retrieveCreditById = Xrm.WebApi.retrieveRecord(agreementCreditId.getValue()[0].entityType, agreementCreditId.getValue()[0].id);
                retrieveCreditById.then(
                    function (retrievedCredit)
                    {
                        if ( retrievedCredit !== null)
                        {
                            agreementFullCreditAmount.setValue(( retrievedCredit["lys_percent"] / 100 * agreementCreditPeriod.getValue() * agreementCreditAmount.getValue() ) + agreementCreditAmount.getValue());
                            agreementFullCreditAmount.fireOnChange();
                        }
                    },
                    function (error)
                    {
                        showAlert(`Ошибка получения экземпляра сущности lys_credit в функции RecalculateCredit\n${error}`, "Ошибка");
                    }
                )
            }
            else
            {
                showAlert(`Проверьте кредитную программу, полную стоимость кредита, сумму кредита, срок кредита\n${error}`, "Ошибка");
            }
        }
    }
})();