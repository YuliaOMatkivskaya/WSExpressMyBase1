//база данных
let socket = io()
socket.on('message', (message) => {
    let baseJson;
    baseJson = message;
    console.log(baseJson)
    let baseOfData = JSON.parse(baseJson, function (key, value) {
        if (key == "date") return new Date(value);
        return value;
    });
    console.log(baseOfData)
    //установка значений по умолчанию и фильтрации по годам с сохранением в локальное хранилище

    let itemYearStart = document.querySelector("#itemYearStart");
    let itemYearFinish = document.querySelector("#itemYearFinish");
    let sendYear = document.querySelector("#sendYear");
    let removeYear = document.querySelector("#removeYear");
    let yearsFilter = document.querySelector("#yearsFilter");
    let wordFilter = document.querySelector("#wordFilter");


    function YearsAreCorrect() {
        if (localStorage.getItem("yearStart") == null || localStorage.getItem("yearFinish") < localStorage.getItem("yearStart") ||
            localStorage.getItem("yearStart") < 2016 || localStorage.getItem("yearFinish") > 2024) {
            itemYearStart.value = 2016;
            localStorage.setItem("yearStart", itemYearStart.value);
        } else {
            itemYearStart.value = localStorage.getItem("yearStart");
        }

        if (localStorage.getItem("yearFinish") == null || localStorage.getItem("yearFinish") < localStorage.getItem("yearStart") ||
            localStorage.getItem("yearFinish") > 2024 || localStorage.getItem("yearFinish") < 2016) {
            itemYearFinish.value = 2024;
            localStorage.setItem("yearFinish", itemYearFinish.value);
        } else {
            itemYearFinish.value = localStorage.getItem("yearFinish");
        }

    }

    function addItemsYears() {

        localStorage.setItem("yearStart", itemYearStart.value);
        localStorage.setItem("yearFinish", itemYearFinish.value);

        setTimeout(() => {
            window.location.reload();
        });
        YearsAreCorrect();
    }

    function removeItemsYears() {
        itemYearStart.value = 2016;
        itemYearFinish.value = 2024;
        localStorage.setItem("yearStart", itemYearStart.value);
        localStorage.setItem("yearFinish", itemYearFinish.value);
        setTimeout(() => {
            window.location.reload();
        });
    }

    sendYear.addEventListener("click", addItemsYears);
    removeYear.addEventListener("click", removeItemsYears);

    //поиск и выбор совпадений по названию объекта

    let text = document.querySelector("#SearchText");
    let sendText = document.querySelector("#sendText");
    let removeText = document.querySelector("#removeText");

    function addItemsText() {
        let val = text.value;
        localStorage.setItem("searchText", val);
        setTimeout(() => {
            window.location.reload();
        });

    }

    function removeItemsText() {
        localStorage.removeItem("searchText");
        text.value = "";
        setTimeout(() => {
            window.location.reload();
        });
    }

    sendText.addEventListener("click", addItemsText);
    removeText.addEventListener("click", removeItemsText);


    //текст, по которому фильтруются названия обьектов
    let valTxt = localStorage.getItem("searchText");
    let regexp = new RegExp(valTxt, 'ig');

    //года, по которым отфильтровать данные
    let yearStart = localStorage.getItem("yearStart") || 2016;
    let yearFinish = localStorage.getItem("yearFinish") || 2024;

    //сохранение визуализации в PDF
    let buttonPDF = document.querySelector("#savePDF");

    function generatePDF() {
        const element = document.querySelector("#container");
        html2pdf()
            .from(element)
            .save();
    }

    buttonPDF.addEventListener("click", generatePDF);

    //графическое изображение данных
    let width = 780;
    let height = 250;
    let heightOfLegend = 45;
    let posLineLegendY = 20;
    let markerWidth = 20;
    let startDiagramX = 85;
    let widthCell = 77;
    let posMarkerYDoing = 200;
    let posMarkerYPlanning = 90;

    //пояснение к маркерам
    let svg1 = d3.select("#container").append("svg");

    svg1.attr("height", heightOfLegend)
        .attr("width", width)
        .style("margin-left", "5px")
        .style("margin-right", "5px")
        .style("margin-top", "5px");

    let arrMark = [{
            color: "green",
            text: "- Пройденные вехи в срок"
        },
        {
            color: "red",
            text: "- Срыв"
        },
        {
            color: "blue",
            text: "- Даты, согласно контрактного графика"
        },
        {
            color: "gray",
            text: "- Прогноз"
        }
    ];

    for (let i = 0; i < arrMark.length; i++) {

        svg1.append("text")
            .attr("x", `${40+i*230}`)
            .attr("y", posLineLegendY + 5)
            .style("font-size", "9px")
            .style("font-weight", 700)
            .text(arrMark[i].text);

        svg1.append("polygon")
            .style("fill", arrMark[i].color)
            .style("stroke", "steelblue")
            .style("stroke-width", "2")
            .attr("points", `${20+i*230} ${posLineLegendY-markerWidth/2}, 
            ${(20+i*230)+markerWidth/2} ${posLineLegendY},
            ${20+i*230} ${posLineLegendY+markerWidth/2}, 
            ${(20+i*230)-markerWidth/2} ${posLineLegendY}`);
        //галочка на маркере
        if (i == 0 || i == 1) {
            svg1.append("line")
                .style("stroke", "blue")
                .style("stroke-width", "2")
                .attr("x1", 20 + i * 230 - markerWidth / 8)
                .attr("y1", posLineLegendY - markerWidth / 8)
                .attr("x2", 20 + i * 230)
                .attr("y2", posLineLegendY + markerWidth / 8);

            svg1.append("line")
                .style("stroke", "blue")
                .style("stroke-width", "2")
                .attr("x1", 20 + i * 230 + markerWidth / 6)
                .attr("y1", posLineLegendY - markerWidth / 6)
                .attr("x2", 20 + i * 230)
                .attr("y2", posLineLegendY + markerWidth / 8);
        }
    }
    //вывод данных


    for (let obj of baseOfData) {


        function objectIsAdded() {
            let svg = d3.select("#container")
                .append("div")
                .attr("class", "box")
                .append("svg");

            svg.style("margin-top", "10px")
                .style("margin-left", "5px")
                .style("margin-right", "5px")
                .attr("height", height)
                .attr("width", width);

            svg.append("line")
                .style("stroke", "gray")
                .style("stroke-width", "1")
                .style("stroke-opacity", "0.4")
                .attr("x1", startDiagramX)
                .attr("y1", 140)
                .attr("x2", width)
                .attr("y2", 140);

            //промежуточные деления и блоки под годы
            for (let i = 0; i < 9; i++) {
                svg.append("line")
                    .style("stroke", "gray")
                    .style("stroke-width", "1")
                    .style("stroke-opacity", "0.4")
                    .attr("x1", startDiagramX + i * widthCell)
                    .attr("y1", 0)
                    .attr("x2", startDiagramX + i * widthCell)
                    .attr("y2", height);

                svg.append("rect")
                    .style("fill", "white")
                    .style("stroke", "rgb(114, 114, 241)")
                    .style("stroke-width", "1")
                    .attr("x", startDiagramX + i * widthCell)
                    .attr("y", 0)
                    .attr("width", widthCell)
                    .attr("height", 30);
                //годы на блоках
                let dateInBlock = 2016 + i;

                svg.append("text")
                    .attr("x", startDiagramX + widthCell / 2 + i * widthCell)
                    .attr("y", 20)
                    .attr("text-anchor", "middle")
                    .style("font-size", "14px")
                    .style("fill", "gray")
                    .text(dateInBlock);
            }

            //отрисовывание точек с фильтрацией по годам
            for (let j = 0; j < obj["planning"].length; j++) {

                let dateOfDoing = obj["doing"][j]["date"];
                let nameDoing = obj["doing"][j]["name"];
                let partOfYearDoing = (30 * dateOfDoing.getMonth() + dateOfDoing.getDate()) / 365; //прошедшая доля текущего года для точки из выполнения
                let dateOfPlanning = obj["planning"][j]["date"];
                let NowDate = new Date();
                let posMarkerXDoing = (startDiagramX + (dateOfDoing.getFullYear() - 2016 + partOfYearDoing) * widthCell);

                let partOfYearPlanning = (30 * dateOfPlanning.getMonth() + dateOfPlanning.getDate()) / 365; //прошедшая доля текущего года для точки из плана
                let posMarkerXPlanning = (startDiagramX + (dateOfPlanning.getFullYear() - 2016 + partOfYearPlanning) * widthCell);
                let namePlanning = obj["planning"][j]["name"];
                //линии плана и выполнения
                if (j + 1 < obj["planning"].length) {
                    let dateOfPlanningNext = obj["planning"][j + 1]["date"];
                    let dateOfDoingNext = obj["doing"][j + 1]["date"];

                    let partOfYearDoingNext = (30 * dateOfDoingNext.getMonth() + dateOfDoingNext.getDate()) / 365; //прошедшая доля текущего года для точки из выполнения
                    let posMarkerXDoingNext = (startDiagramX + (dateOfDoingNext.getFullYear() - 2016 + partOfYearDoingNext) * widthCell);

                    let partOfYearPlanningNext = (30 * dateOfPlanningNext.getMonth() + dateOfPlanningNext.getDate()) / 365; //прошедшая доля текущего года для точки из плана
                    let posMarkerXPlanningNext = (startDiagramX + (dateOfPlanningNext.getFullYear() - 2016 + partOfYearPlanningNext) * widthCell);
                    if (obj["planning"][j]["date"].getFullYear() >= yearStart && obj["planning"][j + 1]["date"].getFullYear() <= yearFinish) {
                        //линия по плану
                        svg.append("line")
                            .style("stroke", "gray")
                            .style("stroke-width", "2")
                            .attr("x1", posMarkerXPlanning + markerWidth / 2)
                            .attr("y1", posMarkerYPlanning)
                            .attr("x2", posMarkerXPlanningNext - markerWidth / 2)
                            .attr("y2", posMarkerYPlanning);
                    }
                    if (obj["doing"][j]["date"].getFullYear() >= yearStart && obj["doing"][j + 1]["date"].getFullYear() <= yearFinish) {
                        //линия по выполнению
                        svg.append("line")
                            .style("stroke", "gray")
                            .style("stroke-width", "2")
                            .attr("x1", posMarkerXDoing + markerWidth / 2)
                            .attr("y1", posMarkerYDoing)
                            .attr("x2", posMarkerXDoingNext - markerWidth / 2)
                            .attr("y2", posMarkerYDoing);
                    }

                }
                //рисуем пунктирную линию, соединяющую маркеры
                if (dateOfPlanning.getFullYear() >= yearStart && dateOfPlanning.getFullYear() <= yearFinish &&
                    dateOfDoing.getFullYear() >= yearStart && dateOfDoing.getFullYear() <= yearFinish) {

                    svg.append("line")
                        .style("stroke", "gray")
                        .style("stroke-width", "2")
                        .style("stroke-dasharray", "4 2") //прерывистая линия
                        .attr("x1", posMarkerXPlanning)
                        .attr("y1", posMarkerYPlanning + markerWidth / 2)
                        .attr("x2", posMarkerXDoing)
                        .attr("y2", posMarkerYDoing - markerWidth / 2);
                }
                if (dateOfDoing.getFullYear() >= yearStart && dateOfDoing.getFullYear() <= yearFinish) {
                    //рисуем точку
                    let color;

                    function ParametersOfMarkers(color) {
                        //условия окрашивания маркера
                        if (dateOfDoing <= dateOfPlanning && !(NowDate <= dateOfPlanning)) {
                            // в срок - маркер зеленый
                            color = "green";
                        } else if (dateOfDoing > dateOfPlanning || NowDate > dateOfPlanning) {
                            // срыв - маркер красный
                            color = "red";
                        } else if (NowDate <= dateOfPlanning) {
                            // в работе - маркер серый
                            color = "gray";
                        }
                        return color;
                    }
                    svg.append("polygon")
                        .style("fill", ParametersOfMarkers(color))
                        .style("stroke", "steelblue")
                        .style("stroke-width", "2")
                        .attr("points", `${posMarkerXDoing} ${posMarkerYDoing-markerWidth/2}, 
                        ${posMarkerXDoing+markerWidth/2} ${posMarkerYDoing},
                        ${posMarkerXDoing} ${posMarkerYDoing+markerWidth/2}, 
                        ${posMarkerXDoing-markerWidth/2} ${posMarkerYDoing}`);
                    //галочка на маркере
                    if (NowDate > dateOfPlanning) {
                        svg.append("line")
                            .style("stroke", "blue")
                            .style("stroke-width", "2")
                            .attr("x1", posMarkerXDoing - markerWidth / 8)
                            .attr("y1", posMarkerYDoing - markerWidth / 8)
                            .attr("x2", posMarkerXDoing)
                            .attr("y2", posMarkerYDoing + markerWidth / 8);

                        svg.append("line")
                            .style("stroke", "blue")
                            .style("stroke-width", "2")
                            .attr("x1", posMarkerXDoing + markerWidth / 6)
                            .attr("y1", posMarkerYDoing - markerWidth / 6)
                            .attr("x2", posMarkerXDoing)
                            .attr("y2", posMarkerYDoing + markerWidth / 8);
                    }

                    textMarkersDate = `${addZero(dateOfDoing.getDate())}` + `.` + `${addZero(dateOfDoing.getMonth()+1)}` +
                        `.` + `${dateOfDoing.getFullYear()}`;
                    svg.append("text")
                        .attr("x", posMarkerXDoing)
                        .attr("y", 230 + 10 * Math.sin(180 * j))
                        .style("font-size", "8px")
                        .style("fill", "black")
                        .text(textMarkersDate);

                    svg.append("text")
                        .attr("x", posMarkerXDoing)
                        .attr("y", 180 + 10 * Math.sin(180 * j))
                        .style("font-size", "10px")
                        .style("fill", "black")
                        .style("font-weight", 700)
                        .text(nameDoing);


                }
                if (dateOfPlanning.getFullYear() >= yearStart && dateOfPlanning.getFullYear() <= yearFinish) {
                    svg.append("polygon")
                        .style("fill", "blue")
                        .style("stroke", "steelblue")
                        .style("stroke-width", "2")
                        .attr("points", `${posMarkerXPlanning} ${posMarkerYPlanning-markerWidth/2}, 
                        ${posMarkerXPlanning+markerWidth/2} ${posMarkerYPlanning},
                        ${posMarkerXPlanning} ${posMarkerYPlanning+markerWidth/2}, 
                        ${posMarkerXPlanning-markerWidth/2} ${posMarkerYPlanning}`);

                    //вывод даты у маркера
                    let textMarkersDate;
                    textMarkersDate = `${addZero(dateOfPlanning.getDate())}` + `.` + `${addZero(dateOfPlanning.getMonth()+1)}` +
                        `.` + `${dateOfPlanning.getFullYear()}`;
                    svg.append("text")
                        .attr("x", posMarkerXPlanning)
                        .attr("y", 120 + 10 * Math.sin(180 * j))
                        .style("font-size", "8px")
                        .style("fill", "black")
                        .text(textMarkersDate);

                    svg.append("text")
                        .attr("x", posMarkerXPlanning)
                        .attr("y", 70 + 10 * Math.sin(180 * j))
                        .style("font-size", "10px")
                        .style("fill", "black")
                        .style("font-weight", 700)
                        .text(namePlanning);
                }
            }
            //вывод названия объекта
            svg.append("text")
                .attr("x", 5)
                .attr("y", 50)
                .style("font-size", "16px")
                .style("fill", "black")
                .style("font-weight", 700)
                .text(obj["title"]);
        }
        //фильтр по названию (ищет совпадения с введенным текстом)
        if (regexp.exec(obj["title"])) {
            objectIsAdded();
            // Если нашло, то выполнить это
            console.log(obj["title"]);
            console.log('Совпадения есть');
        } else if (!valTxt) {
            objectIsAdded();
            // Если нет фильтра, то выполнить это
            console.log('Фильтр не включен');
        } else {
            console.log(obj["title"]);
            console.log('Совпадений нет');
        }

    }
    //вспомогательная функция,добавляем ноль в дате перед значением месяца и дня, если они меньше 10
    function addZero(n) {
        return (parseInt(n, 10) < 10 ? '0' : '') + n;
    }

    //вывод пояснения к фильтрации
    let textYearsInterval;
    let textWordFilter;
    (localStorage.getItem("yearStart") && localStorage.getItem("yearFinish")) ? textYearsInterval = `Период по умолчанию 2016-2024, установлен период:` + `${localStorage.getItem("yearStart")}` + `-` + `${localStorage.getItem("yearFinish")}`: textYearsInterval = `2016-2024`;

    (localStorage.getItem("searchText")) ? textWordFilter = `Фильтрация по совпадению с: ` + `"` + `${localStorage.getItem("searchText")}` + `"`: textWordFilter = `Фильтр не установлен`;
    wordFilter.innerHTML = textWordFilter;
    yearsFilter.innerHTML = textYearsInterval;
})

socket.on('private message', (message) =>
    console.log(
        'Private message from server: ',
        message
    )
)