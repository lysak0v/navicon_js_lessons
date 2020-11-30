/* Объявление переменных */
let vat;

let payerName = IMask(
    document.getElementById('payerName'),
    {
        mask: /[A-Za-zА-Яа-я]+/
    });

/* Маска поля "Контактный телефон" */
let phoneMask = IMask(
    document.getElementById('phone'), {
        mask: '+{7}(000)000-00-00'
    });

/* Маска поля "Сумма платежа" */
let amountOfPaymentMask = IMask(
    document.getElementById('amountOfPayment'),
    {
        mask: Number,
        signed: false,
        radix: ".",
        scale: 2
    });

/* Маска поля "Итог" */
let summary = IMask(
    document.getElementById('summary'),
    {
        mask: Number,
        signed: false,
        radix: ".",
        scale: 2
    });

/* Маска поля "ИНН" */
let inn = IMask(
    document.getElementById('inn'),
    {
        mask: "0000000000",
        signed: false,
        scale: 0
    });

/* Ограничения для validate.js */
let constraints = {
    payerName: {
        presence: true,
        format: {
            pattern: "[А-Яа-яA-Za-z]+",
            flags: "i",
            message: "может содержать только латиницу или кириллицу"
        }
    },
    payerType: {
        presence: true,
        exclusion: {
            within: ["placeholder"],
            message: "выберите тип плательщика"
        }
    },
    legalEntityType: {
        presence: false,
        exclusion: {
            within: ["placeholder"],
            message: "выберите форму юр.лица"
        }
    },
    inn: {
        presence: true,
        format: {
            pattern: "\\d{10}",
            message: "должен содержать 10 цифр"
        },
        numericality: {
            onlyInteger: true
        },
    },
    amountOfPayment: {
        presence: true,
        numericality: {
            greaterThan: 0
        }
    }
};

/* Подписка на событие загрузки DOM  и иные события */
$(document).ready(function () {
    $("#payerType").change(checkPayerType);
    $("#amountOfPayment").change(function (){
        validateForm($("#mainForm"), getConstraints(constraints));
    });
    $("#simplifiedFormOfTaxation").change(simplifiedFormOfTaxationChanged);
    $("#mainForm").change(function () {
        validateForm($("#mainForm"), getConstraints(constraints));
        countSummary();
    });
});

/* Функция проверяет выбранный тип плательщика,
 устанавливает соответствующий НДС, скрывает/отображает поле "Форма юр.лица" и "Упрощенное налогооблажение",
  если выбранн тип плательщика отличающийся от "Юридическое лицо",
   то выключается чекбокс "Упрощенное налогооблажение" и вызывается функция simplifiedFormOfTaxationChanged */
function checkPayerType() {
    switch ($("#payerType").val()) {
        case "placeholder":
            $("#vatInput").val("НДС");
            vat = 0;
            break;
        case "privatePerson":
            $("#vatInput").val("НДС 13%");
            vat = 13;
            break;
        case "legalEntity":
            $("#vatInput").val("НДС 17%");
            vat = 17;
            break;
    }
    ;

    if ($("#payerType").val() == "legalEntity") {
        $("#legalEntityType").show();
        $("#simplifiedFormOfTaxationContainer").show();
    } else {
        $("#legalEntityType").hide();
        $("#simplifiedFormOfTaxationContainer").hide();
        $("#simplifiedFormOfTaxation").prop("checked", false);
        simplifiedFormOfTaxationChanged();
    }
    ;
};

/* Функция очищает и отключает поле ИНН если чекбокс включен */
function simplifiedFormOfTaxationChanged() {
    if ($("#simplifiedFormOfTaxation").is(":checked")) {
        $("#inn").val("");
        inn.unmaskedValue = "";
        inn.updateControl();
        $("#inn").prop("disabled", true);
    } else {
        $("#inn").prop("disabled", false);
    }
    ;
};


/* Функция возвращает ограничения для validate.js в зависимости от состояния элементов DOM */
function getConstraints() {
    if ($("#simplifiedFormOfTaxation").is(":checked")) {
        constraints.inn.presence = false;
    } else {
        constraints.inn.presence = true;
    }
    ;

    if ($("#payerType").val() == "legalEntity") {
        constraints.legalEntityType.presence = true;
        constraints.legalEntityType.exclusion.within = ["placeholder"];
        constraints.inn.format.pattern = "\\d{10}";
        constraints.inn.format.message = "должен содержать 10 цифр";
        inn.mask = "0000000000";
        inn.updateControl();
    } else {
        constraints.legalEntityType.presence = false;
        constraints.legalEntityType.exclusion.within = [];
        constraints.inn.format.pattern = "\\d{12}";
        constraints.inn.format.message = "должен содержать 12 цифр";
        inn.mask = "000000000000";
        inn.updateControl();
    }
    ;

    return constraints;
};

/* Функция валидации элементов формы */
function validateForm(form) {
    let errors = validate(form, constraints);

    $("input, select").removeClass("invalid");
    if (errors) {
        showValidationError(errors);
    };

    if (phoneMask.unmaskedValue.length !== 11){
        $("#phone").addClass("invalid");
    }
    else{
        $("#phone").removeClass("invalid");
    };
};

/* Функция применения стилей к невалидным элементам */
function showValidationError(errors) {
    $("input, select").removeClass("invalid");

    document.getElementById("mainForm").querySelectorAll("input[name], select[name]").forEach(control => {
        for(let error in errors)
            if (control.name == error){
                $(`#${control.id}`).addClass("invalid");
            };
    });
};


/* Функция подсчета итога */
function countSummary(){
    let countOfInvalidElements = $(".invalid").length;

    if (countOfInvalidElements <= 0){
        summary.unmaskedValue = `${amountOfPaymentMask.unmaskedValue * (1 + vat / 100)}`;
        summary.updateControl();
    } else {
        summary.unmaskedValue = "";
        summary.updateControl();
    };
};