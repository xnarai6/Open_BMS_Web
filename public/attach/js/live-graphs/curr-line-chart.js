//전류 그래프 start
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
    //colors: ["#5b73e8", "#f1b44c", "#34c38f"],
    colors: ["#f1b44c", "#a5b7d4", "#a5b7d4", "#a5b7d4"],
    dataLabels: {
        enabled: !1
    },
    stroke: {
        width: [3, 2, 2, 2],
        curve: "smooth",
        dashArray: [0, 8, 8, 8]
    },
    series: [{
        data: []
    }],
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
    (currChart = new ApexCharts(document.querySelector("#curr_line_chart_dashed"), options)).render();
    //전류 그래프 end

    var data = [];

    function currGraphInit(graphDataForCurr, xDataForCurr, btryInfo){

        data = graphDataForCurr;

        const max = Array.from({length: 100}, () => btryInfo.btry_max_curr);
        const min = Array.from({length: 100}, () => btryInfo.btry_min_curr);
        const rat = Array.from({length: 100}, () => btryInfo.btry_rat_curr);
        
        currChart.updateOptions({
            series: [{
                name:'전류',
                type: 'line',
                data: graphDataForCurr
            },{
                name:'최대 전류',
                type: 'line',
                data: max
            },{
                name:'최소 전류',
                type: 'line',
                data: min
            },{
                name:'정격 전류',
                type: 'line',
                data: rat
            }],
            labels: xDataForCurr
        })
    }

    function currGraphUpdate(newData){

        data.shift();
        data.push(newData);

        currChart.updateSeries([{
            data: data
        }])
    }