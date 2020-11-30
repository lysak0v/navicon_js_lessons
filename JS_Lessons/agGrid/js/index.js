/* Объявление переменных */

// Ссылка на JSON файл
const urlToJson = "https://api.github.com/repositories";

// Количество строк на страницу
let countOfItemsPerPage;

// Блок, где будет хранится таблица
let eGridDiv;

// Модель данных JSON файла
let columnDefs = [
    {headerName: "id", field: "id"},
    {headerName: "node_id", field: "node_id"},
    {headerName: "name", field: "name"},
    {headerName: "full_name", field: "full_name"},
    {headerName: "private", field: "private"},
    {headerName: "owner",
    children: [
        {headerName: "owner.login", field: "owner.login"},
        {headerName: "owner.id", field: "owner.id"},
        {headerName: "owner.node_id", field: "owner.node_id"},
        {headerName: "owner.avatar_url", field: "owner.avatar_url"},
        {headerName: "owner.gravatar_id", field: "owner.gravatar_id"},
        {headerName: "owner.url", field: "owner.url"},
        {headerName: "owner.html_url", field: "owner.html_url"},
        {headerName: "owner.followers_url", field: "owner.followers_url"},
        {headerName: "owner.following_url", field: "owner.following_url"},
        {headerName: "owner.gists_url", field: "owner.gists_url"},
        {headerName: "owner.starred_url", field: "owner.starred_url"},
        {headerName: "owner.subscriptions_url", field: "owner.subscriptions_url"},
        {headerName: "owner.organizations_url", field: "owner.organizations_url"},
        {headerName: "owner.repos_url", field: "owner.repos_url"},
        {headerName: "owner.events_url", field: "owner.events_url"},
        {headerName: "owner.received_events_url", field: "owner.received_events_url"},
        {headerName: "owner.type", field: "owner.type"},
        {headerName: "owner.site_admin", field: "owner.site_admin"},
    ]},
    {headerName: "html_url", field: "html_url"},
    {headerName: "description", field: "description"},
    {headerName: "fork", field: "fork"},
    {headerName: "url", field: "url"},
    {headerName: "forks_url", field: "forks_url"},
    {headerName: "keys_url", field: "keys_url"},
    {headerName: "collaborators_url", field: "collaborators_url"},
    {headerName: "teams_url", field: "teams_url"},
    {headerName: "hooks_url", field: "hooks_url"},
    {headerName: "issue_events_url", field: "issue_events_url"},
    {headerName: "events_url", field: "events_url"},
    {headerName: "assignees_url", field: "assignees_url"},
    {headerName: "branches_url", field: "branches_url"},
    {headerName: "tags_url", field: "tags_url"},
    {headerName: "blobs_url", field: "blobs_url"},
    {headerName: "git_tags_url", field: "git_tags_url"},
    {headerName: "git_refs_url", field: "git_refs_url"},
    {headerName: "trees_url", field: "trees_url"},
    {headerName: "statuses_url", field: "statuses_url"},
    {headerName: "languages_url", field: "languages_url"},
    {headerName: "stargazers_url", field: "stargazers_url"},
    {headerName: "contributors_url", field: "contributors_url"},
    {headerName: "subscribers_url", field: "subscribers_url"},
    {headerName: "subscription_url", field: "subscription_url"},
    {headerName: "commits_url", field: "commits_url"},
    {headerName: "git_commits_url", field: "git_commits_url"},
    {headerName: "comments_url", field: "comments_url"},
    {headerName: "issue_comment_url", field: "issue_comment_url"},
    {headerName: "contents_url", field: "contents_url"},
    {headerName: "compare_url", field: "compare_url"},
    {headerName: "merges_url", field: "merges_url"},
    {headerName: "archive_url", field: "archive_url"},
    {headerName: "downloads_url", field: "downloads_url"},
    {headerName: "issues_url", field: "issues_url"},
    {headerName: "pulls_url", field: "pulls_url"},
    {headerName: "milestones_url", field: "milestones_url"},
    {headerName: "notifications_url", field: "notifications_url"},
    {headerName: "labels_url", field: "labels_url"},
    {headerName: "releases_url", field: "releases_url"},
    {headerName: "deployments_url", field: "deployments_url"}
];

// Опции ap-Grid
let gridOptions = {
    columnDefs: columnDefs,
    pagination: true,
    paginationPageSize: 10
};

/* Подписка на событие загрузки DOM и иные события, иницилизация таблицы */
$(document).ready(function () {
    //
    $(".main-container, #mainForm, #myGrid").width(window.innerWidth - 20);
    $(".main-container, #mainForm, #myGrid").height(window.innerHeight - 20);
    eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
    agGrid.simpleHttpRequest({url: urlToJson}).then(function(data) {
        gridOptions.api.setRowData(data);
        setCountOfItemsPerPage();
        autoSizeAll(true);
    });
});

/* Подписка на событие изменения размера рабочего окна */
window.onresize = function (event) {
    $(".main-container, #mainForm, #myGrid").width(window.innerWidth - 20);
    $(".main-container, #mainForm, #myGrid").height(window.innerHeight - 20);
    autoSizeAll(true);
};

/* Функция авто установки ширины колонок, параметр true/false не учитывает header */
function autoSizeAll(skipHeader) {
    let allColumnIds = [];
    gridOptions.columnApi.getAllColumns().forEach(function (column) {
        allColumnIds.push(column.colId);
    });

    gridOptions.columnApi.autoSizeColumns(allColumnIds, skipHeader);
};

/* Функция устанавливает количество строк на страницу таблицы, вводи через prompt*/
function setCountOfItemsPerPage() {
    do {
        countOfItemsPerPage  = prompt("Please enter count of items that will be loaded per page:");
    } while (isNaN(countOfItemsPerPage));
    if (!isNaN(countOfItemsPerPage)){
        gridOptions.api.paginationSetPageSize(countOfItemsPerPage);
    };
};