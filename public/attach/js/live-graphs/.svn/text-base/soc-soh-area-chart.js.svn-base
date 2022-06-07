options = {
    chart: {
        height: 350,
        type: "area",
        toolbar: {
            show: !1
        }
    },
    dataLabels: {
        enabled: !1
    },
    stroke: {
        curve: "smooth",
        width: 3
    },
    series: [{
        name:'SOC',
        type: 'area',
        data: []
    },{
        name:'SOH',
        type: 'area',
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
    (socAndSohChart = new ApexCharts(document.querySelector("#soc_and_soh_spline_area"), options)).render();


    var data3 = [];
    var data4 = [];
    var globalLastKey2;
    var globalBmsSeq2;
    var globalXData2 = [];
    var globalCmpySeq2;

    var interval2 = null;


    function socAndSohGraphInit(graphData, graphData2, x, lastKey, bmsSeq, cmpySeq){

        data3 = graphData;
        data4 = graphData2;
        if(graphData == null || graphData.length == 0){data3 = []}
        if(graphData2 == null || graphData2.length == 0){data4 = []}
        globalLastKey2 = lastKey;
        globalBmsSeq2 = bmsSeq;
        globalXData2 = x;
        globalCmpySeq2 = cmpySeq;

        socAndSohChart.updateOptions({
            series: [{
                name:'SOC',
                type: 'area',
                data: data3
            },{
                name:'SOH',
                type: 'area',
                data: data4
            }],
            labels: x
        })


        if(interval2 != null){
            clearInterval(interval2);
        }
        
        interval2 = setInterval(() => socAndSohGraphUpdate(), 30000);
        
    }

    
    function socAndSohGraphUpdate(){


        let postData = {
            bms_seq: globalBmsSeq2,
            last_key: globalLastKey2,
            cmpy_seq: globalCmpySeq2
        }

        //post 통신
        let result = syncAjax("POST", "/log/livedata", postData);

        if(result.lastKey != null && result.lastKey > globalLastKey2){
            globalLastKey2 = result.lastKey;
            var socData = result.socData;
            var sohData = result.sohData;
            var xData2 = result.xData;
    
            for(var i = 0; i < socData.length; i++){
                data3.shift();
                data4.shift();
                data3.push(socData[i]);
                data4.push(sohData[i]);
            }


            // socAndSohChart.updateOptions({
            //     series: [{
            //         name:'SOC',
            //         type: 'area',
            //         data: data3
            //     },{
            //         name:'SOH',
            //         type: 'area',
            //         data: data4
            //     }],
            //     labels: globalXData2
            // })        

            socAndSohChart.updateSeries([{
                data: data3
            },{
                data: data4
            }])

         }

        



    }