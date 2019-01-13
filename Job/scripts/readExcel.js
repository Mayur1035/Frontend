$(function () {
    $("#result").hide();
    $("#loaderCall").hide();
    $("#inputGroupFile02").on("change", function () {
        var excelFile,
            fileReader = new FileReader();

        $("#query").hide();
        $("#loaderCall").show();

        fileReader.onload = function (e) {
            var buffer = new Uint8Array(fileReader.result);

            $.ig.excel.Workbook.load(buffer, function (workbook) {
                var column, row, newRow, cellValue, columnIndex, i,
                    worksheet = workbook.worksheets(0),
                    columnsNumber = 0,
                    gridColumns = [],
                    data = [],
                    worksheetRowsCount;

                // Both the columns and rows in the worksheet are lazily created and because of this most of the time worksheet.columns().count() will return 0
                // So to get the number of columns we read the values in the first row and count. When value is null we stop counting columns:
                while (worksheet.rows(0).getCellValue(columnsNumber)) {
                    columnsNumber++;
                }

                // Iterating through cells in first row and use the cell text as key and header text for the grid columns
                for (columnIndex = 0; columnIndex < columnsNumber; columnIndex++) {
                    column = worksheet.rows(0).getCellText(columnIndex);
                    gridColumns.push({ headerText: column, key: column });
                }

                // We start iterating from 1, because we already read the first row to build the gridColumns array above
                // We use each cell value and add it to json array, which will be used as dataSource for the grid
                for (i = 1, worksheetRowsCount = worksheet.rows().count(); i < worksheetRowsCount; i++) {
                    newRow = {};
                    row = worksheet.rows(i);

                    for (columnIndex = 0; columnIndex < columnsNumber; columnIndex++) {
                        cellValue = row.getCellText(columnIndex);
                        newRow[gridColumns[columnIndex].key] = cellValue;
                    }

                    data.push(newRow);
                }
                // we can also skip passing the gridColumns use autoGenerateColumns = true, or modify the gridColumns array
                createCharts(data);
            }, function (error) {
                $("#result").text("The excel file is corrupted.");
                $("#result").show(1000);
            });
        }

        if (this.files.length > 0) {
            excelFile = this.files[0];
            if (excelFile.type === "application/vnd.ms-excel" || excelFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || (excelFile.type === "" && (excelFile.name.endsWith("xls") || excelFile.name.endsWith("xlsx") || excelFile.name.endsWith("csv")))) {
                fileReader.readAsArrayBuffer(excelFile);
            } else {
                $("#result").text("The format of the file you have selected is not supported. Please select a valid Excel file ('.xls, *.xlsx').");
                $("#result").show(1000);
            }
        }

    })
});

function createCharts(data) {
   // $("#loaderCall").hide();
    $("#result").show();

    var categoryArray = [];
    var maleCharges = [];
    var femalecharges = [];
    var moptionArray = [];
    var foptionArray = [];
    var mcontractArray = [];
    var fcontractArray = [];
    data.forEach(element => {
        categoryArray.push(element.PaymentMethod);
        var subCharges = [];
        subCharges.push(parseFloat(element.TotalCharges));
        subCharges.push(parseFloat(element.MonthlyCharges));
        if (element.gender === 'Male') {
            maleCharges.push(subCharges);
            moptionArray.push(element.InternetService);
            mcontractArray.push(element.Contract);
        } else {
            femalecharges.push(subCharges);
            foptionArray.push(element.InternetService);
            fcontractArray.push(element.Contract);
        }
    });
    var catArr = categoryArray;
    categoryArray = Array.from(new Set(categoryArray)).sort();
    var categoryArrayCnt = {};
    categoryArray.forEach(v => {
        categoryArrayCnt[v] = catArr.filter(val => val === v).length;
    });
    var moptArr = moptionArray;
    moptionArray = Array.from(new Set(moptionArray)).sort();
    var moptionArrayCnt = {};
    moptionArray.forEach(v => {
        moptionArrayCnt[v] = moptArr.filter(val => val === v).length;
    });
    var foptArr = foptionArray;
    foptionArray = Array.from(new Set(foptionArray)).sort();
    var foptionArrayCnt = {};
    foptionArray.forEach(v => {
        foptionArrayCnt[v] = foptArr.filter(val => val === v).length;
    });
    var mconArr = mcontractArray;
    mcontractArray = Array.from(new Set(mcontractArray)).sort();
    var mcontractArrayCnt = {};
    mcontractArray.forEach(v => {
        mcontractArrayCnt[v] = mconArr.filter(val => val === v).length;
    });
    var fconArr = fcontractArray;
    fcontractArray = Array.from(new Set(fcontractArray)).sort();
    var fcontractArrayCnt = {};
    fcontractArray.forEach(v => {
        fcontractArrayCnt[v] = fconArr.filter(val => val === v).length;
    });
    var contractAvgArr = [];
    for (i = 0; i < mcontractArray.length; i++) {
        contractAvgArr[i] = (mcontractArrayCnt[mcontractArray[i]]
            + fcontractArrayCnt[fcontractArray[i]]) / 2;
    }

    Highcharts.chart('chart1_container', {
        title: {
            text: 'Contract Type Informations'
        },
        xAxis: {
            categories: mcontractArray
        },
        labels: {
            items: [{
                html: 'Total number of contracts',
                style: {
                    left: '50px',
                    top: '18px',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
                }
            }]
        },
        series: [{
            type: 'column',
            name: 'Male',
            data: [mcontractArrayCnt[mcontractArray[0]], mcontractArrayCnt[mcontractArray[1]], mcontractArrayCnt[mcontractArray[2]]]
        }, {
            type: 'column',
            name: 'Female',
            data: [fcontractArrayCnt[fcontractArray[0]], fcontractArrayCnt[fcontractArray[1]], fcontractArrayCnt[fcontractArray[2]]]
        }, {
            type: 'spline',
            name: 'Average',
            data: contractAvgArr,
            marker: {
                lineWidth: 2,
                lineColor: Highcharts.getOptions().colors[3],
                fillColor: 'white'
            }
        }]
    });



    Highcharts.chart('chart2_container', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Service Type Informations'
        },
        xAxis: {
            categories: moptionArray
        },
        yAxis: {
            title: {
                text: 'Internet Services'
            }
        },
        series: [
            {
                name: 'Male',
                data: [moptionArrayCnt[moptionArray[0]], moptionArrayCnt[moptionArray[1]], moptionArrayCnt[moptionArray[2]]]
            },
            {
                name: 'Female',
                data: [foptionArrayCnt[foptionArray[0]], foptionArrayCnt[foptionArray[1]], foptionArrayCnt[foptionArray[2]]]
            }]
    });

    // Radialize the colors
    Highcharts.setOptions({
        colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
            return {
                radialGradient: {
                    cx: 0.5,
                    cy: 0.3,
                    r: 0.7
                },
                stops: [
                    [0, color],
                    [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
                ]
            };
        })
    });

    // Build the chart
    Highcharts.chart('chart3_container', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Form of Payments Used'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    },
                    connectorColor: 'silver'
                }
            }
        },
        series: [{
            name: 'Share',
            data: [
                { name: categoryArray[0], y: categoryArrayCnt[categoryArray[0]] },
                { name: categoryArray[1], y: categoryArrayCnt[categoryArray[1]] },
                { name: categoryArray[2], y: categoryArrayCnt[categoryArray[2]] },
                { name: categoryArray[3], y: categoryArrayCnt[categoryArray[3]] }
            ]
        }]
    });



    Highcharts.chart('chart4_container', {
        chart: {
            type: 'scatter',
            zoomType: 'xy'
        },
        title: {
            text: 'Total Versus Monthly charges of all Individuals by Gender'
        },
        subtitle: {
            text: 'Source: Equifax Archive'
        },
        xAxis: {
            title: {
                enabled: true,
                text: 'Total Charges ( $ )'
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true
        },
        yAxis: {
            title: {
                text: 'Monthly Charges ( $ )'
            }
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 100,
            y: 70,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
            borderWidth: 1
        },
        plotOptions: {
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x} $, {point.y} $'
                }
            }
        },
        series: [{
            name: 'Female',
            color: 'rgba(223, 83, 83, .5)',
            data: femalecharges

        }, {
            name: 'Male',
            color: 'rgba(119, 152, 191, .5)',
            data: maleCharges
        }]
    });


}