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


    form.addEventListener("submit", function (){
        validateForm(form)
    });
    form.addEventListener("change", function (){
        validateForm(form)
    });

    $("#citySelect").blur(validateCitySelect);
    $("#bdDay").blur(validateDate);
    $("#bdMonth").blur(validateDate);
    $("#bdYear").blur(validateDate);
}

/* Функция навешивает меняет стиль элемента на валидный */
function makeControlValid(control) {

    control.classList.remove("invalid");
    control.classList.add("valid");

}
/* Функция меняет стиль элементов формы select, input на валидный */
function makeAllControlsValid(formToValidate){
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
function getConstraints(){
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
function validateForm(formToValidate){
    makeAllControlsValid(formToValidate);
    let errors = validate(formToValidate, getConstraints());
    if (errors){
        showErrors(formToValidate, errors);
        submitButton.setAttribute("disabled", "disabled");
        alertDiv.style.display = "block";
    }else {
        submitButton.removeAttribute("disabled", "disabled");
        alertDiv.style.display = "none";
    }
}

/* Функция применяет стили невалидным элементам формы */
function showErrors(formToValidate, errors){
    formToValidate.querySelectorAll("select[name], input[name]").forEach(control => {
        for(let error in errors)
            if (control.name == error){
                makeControlInvalid(control)
            }
        }
    )
}

/* Функция валидации даты */
function validateDate(){
    let isValid = moment(`${bdDayInput.value}-${bdMonthInput.value}-${bdYearInput.value}`,['DD-MM-YYYY', "D-MM-YYYY", "D-M-YYYY"], true).isValid();

    if (!isValid && (bdDayInput.value !== '' && bdMonthInput.value !== '' && bdYearInput !== '')){
        makeControlInvalid(bdDayInput);
        makeControlInvalid(bdMonthInput);
        makeControlInvalid(bdYearInput);
        return;
    }else {
        makeControlValid(bdDayInput);
        makeControlValid(bdMonthInput);
        makeControlValid(bdYearInput);
    }

    if (bdDayInput.value === ''){
        makeControlInvalid(bdDayInput)
    }else {
        makeControlValid(bdDayInput)
    }
    if (bdMonthInput.value === ''){
        makeControlInvalid(bdMonthInput)
    }else {
        makeControlValid(bdMonthInput)
    }
    if (bdYearInput.value === ''){
        makeControlInvalid(bdYearInput)
    }else {
        makeControlValid(bdYearInput)
    }
}