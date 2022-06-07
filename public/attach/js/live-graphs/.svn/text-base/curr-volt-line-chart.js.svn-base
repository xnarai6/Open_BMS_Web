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
    colors: ["#f1b44c", "#5b73e8", "#a5b7d4", "#a5b7d4", "#a5b7d4"],
    dataLabels: {
        enabled: !1
    },
    stroke: {
        width: [3, 3],
        curve: "smooth",
        dashArray: [0, 0]
    },
    series: [{
        name:'전류',
        type: 'line',
        data: []
    },{
        name:'전압',
        type: 'line',
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
    (currAndVoltChart = new ApexCharts(document.querySelector("#curr_and_volt_line_chart_dashed"), options)).render();
    //전류 그래프 end

    var data1 = [];
    var data2 = [];
    var globalLastKey;
    var globalBmsSeq;
    var globalXData = [];
    var globalCmpySeq;

    var interval = null;

    function currAndVoltGraphInit(graphData, graphData2, xData, lastKey, bmsSeq, cmpySeq){
        
        data1 = graphData;
        data2 = graphData2;
        if(graphData == null || graphData.length == 0){data1 = []}
        if(graphData2 == null || graphData2.length == 0){data2 = []}
        globalLastKey = lastKey;
        globalBmsSeq = bmsSeq;
        globalXData = xData;
        globalCmpySeq = cmpySeq;

        currAndVoltChart.updateOptions({
            series: [{
                name:'전류',
                type: 'line',
                data: data1
            },{
                name:'전압',
                type: 'line',
                data: data2
            }],
            labels: xData,
            yaxis: [
                {
                  title: {
                    text: "전류"
                  }
                },
                {
                  opposite: true,
                  title: {
                    text: "전압"
                  }
                }
              ]
        })

        if(interval != null){
            clearInterval(interval);
        }

        interval = setInterval(() => currAndVoltGraphUpdate(), 30000);

    }

    function currAndVoltGraphUpdate() {

        
        let postData = {
            bms_seq: globalBmsSeq,
            last_key: globalLastKey,
            cmpy_seq: globalCmpySeq
        }

        //post 통신
        let result = syncAjax("POST", "/log/livedata", postData);

        if(result.lastKey != null && result.lastKey > globalLastKey){
            globalLastKey = result.lastKey;
            var currData = result.currData;
            var voltData = result.voltData;
            var xData = result.xData;
    

            for(var i = 0; i < currData.length; i++){
                data1.shift();
                data2.shift();
                globalXData.shift();
                data1.push(currData[i]);
                data2.push(voltData[i]);
                globalXData.push(xData[i]);
            }

            currAndVoltChart.updateOptions({
                series: [{
                    name:'전류',
                    type: 'line',
                    data: data1
                },{
                    name:'전압',
                    type: 'line',
                    data: data2
                }],
                labels: globalXData
            })

        }
        
    }

    
    
    
      