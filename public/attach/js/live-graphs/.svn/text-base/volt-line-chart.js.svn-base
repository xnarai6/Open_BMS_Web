//전압 그래프 start
options = {
    chart: {
        height: 380,
        type: "line",
        zoom: {
            enabled: !1
        },
        toolbar: {
            show: !1
        }
    },
    colors: ["#5b73e8", "#a5b7d4", "#a5b7d4", "#a5b7d4"],
    dataLabels: {
        enabled: !1
    },
    stroke: {
        width: [3, 2, 2, 2],
        curve: "smooth",
        dashArray: [0, 8, 8, 8]
    },
    series: [],
    title: {
        text: "",
        align: "left"
    },
    markers: {
        size: 0,
        hover: {
            sizeOffset: 6
        }
    },
    xaxis: {
        categories: []
    },
    tooltip: {
        y: [{
            title: {
                formatter: function(e) {
                    return e
                }
            }
        }]
    },
    grid: {
        borderColor: "#f1f1f1"
    }
    };
    (voltChart = new ApexCharts(document.querySelector("#volt_line_chart_dashed"), options)).render();
//전압 그래프 end


    var data = [];

    function voltGraphInit(graphDataForVolt, xDataForVolt, btryInfo){

        data = graphDataForVolt;

        const max = Array.from({length: 100}, () => btryInfo.btry_max_volt);
        const min = Array.from({length: 100}, () => btryInfo.btry_min_volt);
        const rat = Array.from({length: 100}, () => btryInfo.btry_rat_volt);

        voltChart.updateOptions({
            series: [{
                name:'전압',
                type: 'line',
                data: graphDataForVolt
            },{
                name:'최대 전압',
                type: 'line',
                data: max
            },{
                name:'최소 전압',
                type: 'line',
                data: min
            },{
                name:'정격 전압',
                type: 'line',
                data: rat
            }],
            labels: xDataForVolt
        })

    }

    function voltGraphUpdate(newData){

        data.shift();
        data.push(newData);

        voltChart.updateSeries([{
            data: data
        }])
    }