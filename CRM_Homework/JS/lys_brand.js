var Navicon = Navicon || {};

Navicon.lys_brand = (function () {

    //Загрузка фрейма с кредитными программами
    var loadIFrame = function (context)
    {
        let formContext = context.getFormContext();
        let brandNameAttribute = formContext.getAttribute("lys_name");
        if (brandNameAttribute !== null)
        {
            if (brandNameAttribute.getValue() !== null)
            {
                let brandId = formContext.data.entity.getId().replace(/[{}]/g, "");
                var query = createQuery(brandId);
                queryMultiple("lys_agreement", query)
                    .then(entities=>{
                        let resourceControl = formContext.getControl("WebResource_credit_frame").getContentWindow();
                        resourceControl
                            .then(function(contentWindow){
                                    //alert(JSON.stringify(entities));
                                    contentWindow.loadTable(formContext, entities);
                                },
                                function(error){
                                    console.log(error.message);
                                });
                    });
            }
        }
    }

    //Функция формирования запроса для получения данных для таблицы кредитных программ
    function createQuery(brandId){
        if (!brandId) return;
        let query = [
            "<fetch xmlns:generator='MarkMpn.SQL4CDS' distinct='true'>",
            "  <entity name='lys_agreement'>",
            "    <attribute name='lys_creditperiod' alias='period' />",
            "    <link-entity name='lys_auto' to='lys_autoid' from='lys_autoid' alias='lys_auto' link-type='inner'>",
            "      <link-entity name='lys_brand' to='lys_brandid' from='lys_brandid' alias='lys_brand' link-type='inner'>",
            "        <attribute name='lys_brandid' />",
            "      </link-entity>",
            "      <link-entity name='lys_model' to='lys_modelid' from='lys_modelid' alias='lys_model' link-type='inner'>",
            "        <attribute name='lys_name' alias='modelName' />",
            "        <attribute name='lys_modelid' alias='modelId' />",
            "      </link-entity>",
            "    </link-entity>",
            "    <link-entity name='lys_credit' to='lys_creditid' from='lys_creditid' alias='lys_credit' link-type='inner'>",
            "      <attribute name='lys_name' alias='creditName' />",
            "      <attribute name='lys_creditid' alias='creditId' />",
            "    </link-entity>",
            "    <filter>",
            `      <condition attribute='lys_brandid' entityname='lys_brand' operator='eq' value='${brandId}' />`,
            "    </filter>",
            "  </entity>",
            "</fetch>",
        ].join("");
        return query;
    }

    //Функция получения множественной выборки, принимает название сущности и fetchXML запрос, возвращает промис
    function queryMultiple(entityName, query){
        return new Promise((resolve, reject)=>{
            if (!entityName || !query) reject("queryMultiple: определены не все параметры");
            Xrm.WebApi.retrieveMultipleRecords(entityName, "?fetchXml="+query)
                .then(data=>{
                        resolve(data.entities);
                    },
                    error=>{
                        reject(error.message);
                    });
        });
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

    return {
        onLoad: function (context) {
            loadIFrame(context);
        }
    }
})();