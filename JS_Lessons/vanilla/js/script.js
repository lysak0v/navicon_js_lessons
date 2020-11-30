let firstNameInput;
let secondNameInput;
let bdDayInput;
let bdMonthInput;
let bdYearInput;
let citySelect;
let submitButton;
let alertDiv;

document.addEventListener("DOMContentLoaded", window.addEventListener("load", ready));

function ready() {
    firstNameInput = document.getElementById("firstName");
    secondNameInput = document.getElementById("secondName");
    bdDayInput = document.getElementById("bdDay");
    bdMonthInput = document.getElementById("bdMonth");
    bdYearInput = document.getElementById("bdYear");
    citySelect = document.getElementById("citySelect");
    submitButton = document.getElementById("submitButton");
    alertDiv = document.getElementById("alertDiv");
    
    firstNameInput.addEventListener("blur", validateFirstname);
    secondNameInput.addEventListener("blur", validateSecondName);
    bdDayInput.addEventListener("blur", validateDate);
    bdMonthInput.addEventListener("blur", validateDate);
    bdYearInput.addEventListener("blur", validateDate);
    citySelect.addEventListener("change", validateCitySelect); 
}

function makeControlValid(control) {

    control.classList.remove("invalid");
    control.classList.add("valid");
    findInvalidControls();
}

function makeControlInvalid(control) {

    control.classList.remove("valid");
    control.classList.add("invalid");
    findInvalidControls();

}

function validateFirstname() {

    if (firstNameInput.value.length > 10) {
        makeControlInvalid(firstNameInput);
    } else {
        makeControlValid(firstNameInput);
    }

}

function validateSecondName() {

    if (secondNameInput.value.length > 15) {
        makeControlInvalid(secondNameInput);
    } else {
        makeControlValid(secondNameInput);
    }

}

function validateDate() {

    if (bdDayInput.value.length > 0 && bdMonthInput.value.length > 0 && bdYearInput.value.length > 0) {
        if (bdDayInput.value.length > 2 || isNaN(bdDayInput.value)) {
            makeControlInvalid(bdDayInput);
        } else {
            makeControlValid(bdDayInput);
        }


        if (bdMonthInput.value.length > 2 || isNaN(bdMonthInput.value)) {
            makeControlInvalid(bdMonthInput);
        } else {
            makeControlValid(bdMonthInput);
        }


        if (bdYearInput.value.length > 4 || bdYearInput.value.length < 4 || isNaN(bdYearInput.value)) {
            makeControlInvalid(bdYearInput);
        } else {
            makeControlValid(bdYearInput);
        }

    } else {
        makeControlValid(bdDayInput);
        makeControlValid(bdMonthInput);
        makeControlValid(bdYearInput);
    }

}

function validateCitySelect() {
    if (citySelect.value == "placeholder") {
        makeControlInvalid(citySelect);
    } else {
        makeControlValid(citySelect);
    }
}

function findInvalidControls() {
    if (document.querySelectorAll("input.invalid").length > 0 || document.querySelectorAll("select.invalid").length > 0) {
        submitButton.setAttribute("disabled", "disabled");
        alertDiv.style.display = "block";
    } else {
        submitButton.removeAttribute("disabled", "disabled");
        alertDiv.style.display = "none";
    }
}