options = {
    chart: {
        height: 350,
        type: "area"
    },
    dataLabels: {
        enabled: !1
    },
    stroke: {
        curve: "smooth",
        width: 3
    },
    series: [{
        name: "SOC(%)",
        data: []
    }],
    colors: ["#5b73e8", "#f1b44c"],
    xaxis: {
        categories: []
    },
    grid: {
        borderColor: "#f1f1f1"
    },
    tooltip: {
        y: [{
            title: {
                formatter: function(e) {
                    return e
                }
            }
        }]
    }
    };
    (socChart = new ApexCharts(document.querySelector("#soc_spline_area"), options)).render();

    var data = []

    function socGraphInit(graphData){

        data = graphData

        console.log(JSON.stringify(data));

        socChart.updateSeries([{
            data: data
        }])

    }

    
    function socGraphUpdate(newData){

        data.shift();
        data.push(newData);

        socChart.updateSeries([{
            data: data
        }])
    }