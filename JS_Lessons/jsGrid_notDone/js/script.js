/* Объявление переменных */
let form;
let firstNameInput;
let secondNameInput;
let bdDayInput;
let bdMonthInput;
let bdYearInput;
let citySelect;
let submitButton;
let alertDiv;
let myData = [
    {firstName: "Иван", secondName: "Иванов", birthday: "1990-03-01", city: "Москва"},
    {firstName: "Алексеев", secondName: "Алексей", birthday: "1982-12-02", city: "Тюмень"}];

/* Подписка на событие загрузки DOM */
document.addEventListener("DOMContentLoaded", window.addEventListener("load", ready));

/* Функция выполняемая при загрузке DOM, здесь осуществляется присваивание переменным DOM элементов и подписка на иные события */
function ready() {
    form = document.querySelector("form#mainForm");
    firstNameInput = document.getElementById("firstName");
    secondNameInput = document.getElementById("secondName");
    bdDayInput = document.getElementById("bdDay");
    bdMonthInput = document.getElementById("bdMonth");
    bdYearInput = document.getElementById("bdYear");
    citySelect = document.getElementById("citySelect");
    submitButton = document.getElementById("submitButton");
    alertDiv = document.getElementById("alertDiv");


    form.addEventListener("submit", function () {
        validateForm(form);
        validateDate();
        validateCitySelect();
        checkInvalidControls();
    });
    form.addEventListener("change", function () {
        validateForm(form);
        validateDate();
        validateCitySelect();
        checkInvalidControls();
    });

    $("#mainForm").submit(submitForm);
    jqGridLoad();

}

/* Функция навешивает меняет стиль элемента на валидный */
function makeControlValid(control) {

    control.classList.remove("invalid");
    control.classList.add("valid");

}

/* Функция меняет стиль элементов формы select, input на валидный */
function makeAllControlsValid(formToValidate) {
    formToValidate.querySelectorAll("select[name], input[name]").forEach(control => makeControlValid(control))
}

/* Функция навешивает меняет стиль элемента на невалидный */
function makeControlInvalid(control) {
    control.classList.remove("valid");
    control.classList.add("invalid");
}

/* Функция валидации элемента citySelect */
function validateCitySelect() {
    if (citySelect.value == "placeholder") {
        makeControlInvalid(citySelect);
    } else {
        makeControlValid(citySelect);
    }
}


/* Функция получения ограничений для validate.js */
function getConstraints() {
    let constraints = {
        firstName: {
            presence: true,
            length: {
                minimum: 1,
                maximum: 10,
                message: "от 1 до 10 символов"
            },
            format: {
                pattern: "[А-Яа-яA-Za-z]+",
                flags: "i",
                message: "может содержать только латиницу или кириллицу"
            }
        },
        secondName: {
            presence: true,
            length: {
                minimum: 1,
                maximum: 15,
                message: "от 1 до 15 символов"
            },
            format: {
                pattern: "[А-Яа-яA-Za-z]+",
                flags: "i",
                message: "может содержать только латиницу или кириллицу"
            }
        }
    };
    return constraints;
}

/* Функция валидации элементов формы */
function validateForm(formToValidate) {
    let errors = validate(formToValidate, getConstraints());
    if (errors) {
        showErrors(formToValidate, errors);
    }
}

/* Функция применяет стили невалидным элементам формы */
function showErrors(formToValidate, errors) {
    makeAllControlsValid(formToValidate);
    formToValidate.querySelectorAll("select[name], input[name]").forEach(control => {
            for (let error in errors)
                if (control.name == error) {
                    makeControlInvalid(control);
                }
        }
    )
}

/* Функция валидации даты */
function validateDate() {
    let isValid = moment(`${bdDayInput.value}-${bdMonthInput.value}-${bdYearInput.value}`, ['DD-MM-YYYY', "D-MM-YYYY", "D-M-YYYY"], true).isValid();

    if (!isValid && (bdDayInput.value !== '' && bdMonthInput.value !== '' && bdYearInput.value !== '')) {
        makeControlInvalid(bdDayInput);
        makeControlInvalid(bdMonthInput);
        makeControlInvalid(bdYearInput);
    } else {
        makeControlValid(bdDayInput);
        makeControlValid(bdMonthInput);
        makeControlValid(bdYearInput);
    }
}

/* Функция загрузки jqGrid таблицы */
function jqGridLoad() {
    $("#jqGrid").jqGrid({
        datatype: "local",
        data: myData,
        height: 210,
        width: 750,
        colModel: [
            {label: 'Имя', name: 'firstName', width: 75, key: true},
            {label: 'Фамилия', name: 'secondName', width: 90},
            {label: 'ДР', name: 'birthday', formatter: "date", formatoptions: {newformat: "d-m-Y"}, width: 100},
            {label: 'Город', name: 'city', width: 80}
        ],
        viewrecords: true, // show the current page, data rang and total records on the toolbar
        caption: "Load jqGrid through Javascript Array",
    });
};

/* Функция проверки наличия невалидных контролов и вкл/выкл внопки submit */
function checkInvalidControls(){
    if ($(".invalid").length > 0){
        submitButton.setAttribute("disabled", "disabled");
        alertDiv.style.display = "block";

    }else {
        submitButton.removeAttribute("disabled", "disabled");
        alertDiv.style.display = "none";

    }
}

/* Функция добавляет строки в таблицу jqGrid из формы */
function submitForm() {
    if (checkInvalidControls){
        $("#jqGrid").addRowData("3", {
            firstName: `${firstNameInput.value}`,
            secondName: `${secondNameInput.value}`,
            birthday: `${bdYearInput.value}-${bdMonthInput.value}-${bdDayInput.value}`,
            city: `${citySelect.value}`
        });
    }
}