document.addEventListener("DOMContentLoaded", window.addEventListener("load", ready));

function ready() {
    //1
    Study.GetData(sortById);
    //2
    Study.GetData(sortByTypeAndSortByIdDescending);
    //3
    Study.GetData(selectWhereTypeEquals2);
    //4
    Study.GetData(selectWhereNameExist);
    //5
    Study.GetData(pushElementAndSortByIdDescending);
    //6
    Study.GetData(spliceElementsWithIndex5And6);

}

//OK
function printAllToConsole(param){
    for (let item of param){
        let currentObj = "";
        for (let property in item){
            currentObj = currentObj + `${property}: ${item[property]}` + " | ";
        }
        console.log(currentObj);
    }
}

//OK
function sortById(param){
    console.log("1. Отсортировать все элементы по свойству id по возрастанию");
    param.sort((a,b) => a.id > b.id ? 1 : -1);
    printAllToConsole(param);
}

//OK
function sortByTypeAndSortByIdDescending(param){
    console.log("2. Отсортировать все элементы по свойству type по возрастанию и свойству id по убыванию");
    param.sort(sortByTypeAscendingAndByIdDescending);
    printAllToConsole(param);
}
//Вспомогательная функция сортировки для задачи 2
function sortByTypeAscendingAndByIdDescending(a, b) {
    let item1 = a['type'];
    let item2 = b['type'];
    if(item1 - item2 !=0){
        return item1 - item2;
    }
    else{
        if (a.id < b.id)
            return 1;
        if (a.id > b.id)
            return -1;
        return 0;
    }
}

//OK
function selectWhereTypeEquals2(param){
    console.log("3. Выбрать только элементы с type = 2");
    printAllToConsole(param.filter(item => item.type === 2));
}

//OK
function selectWhereNameExist(param){
    console.log("4. Выбрать только элементы, у которых заполнено имя");
    printAllToConsole(param.filter(item => item.name != null));
}

//OK
function pushElementAndSortByIdDescending(param){
    console.log("5. Добавить в коллекцию элемент с недостающим идентификатором. Отсортировать коллекцию в порядке убывания идентификаторов");
    param.push(
        {
            name: _0x794d[Math.floor((Math.random() * 6) + 1)],
            type: 1
        },
    );
    param.sort((a,b) => a.id < b.id ? 1 : -1);
    printAllToConsole(param);
}

//OK
function spliceElementsWithIndex5And6(param){
    console.log("6. Вырезать из коллекции элементы с третьего по пятый.");
    printAllToConsole(param.splice(2, 3));
}