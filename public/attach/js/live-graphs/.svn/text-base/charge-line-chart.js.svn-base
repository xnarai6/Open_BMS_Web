/**
 * analytics 주간별 충전시간, 충전횟수 그래프
 */

//전류 그래프 start
var options = {
    chart: {
        height: 350,
        type: 'bar',
        toolbar: {
            show: false,
        }
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '45%',
            endingShape: 'rounded'	
        },
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
    },
    series: [{
        name: '평균충전시간',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0]
    }, {
        name: '충전건수',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0]
    }],
    colors: ['#f1b44c', '#5b73e8'],
    xaxis: {
        categories: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    },
    yaxis: {
        title: {
            text: ''
        }
    },
    grid: {
        borderColor: '#f1f1f1',
    },
    fill: {
        opacity: 1

    },
    tooltip: {
        y: {
            formatter: function (val) {
                return  val + ""
            }
        }
    }
}

var chart = new ApexCharts(
    document.querySelector("#column_chart"),
    options
);

chart.render();

//(chart = new ApexCharts(document.querySelector("#column_chart"), options)).render();


var data = []
//chargelineGraphInit(chrg_cnt, avg_chrg_time, sttc_dt);
function chargelineGraphInit(graphData, graphData2, xData){

    chart.updateOptions({
        series: [{
            name: '평균충전시간',
            data: graphData2
        }, {
            name: '충전건수',
            data: graphData
        }],
        xaxis: {
            categories: xData
        }
    })
}

function clearlineGraphInit(){

    chart.updateOptions({
        series: [{
            name: '평균충전시간',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0]
        }, {
            name: '충전건수',
            data:  [0, 0, 0, 0, 0, 0, 0, 0, 0]
        }],
      //  xaxis: {
       //     categories:  [0, 0, 0, 0, 0, 0, 0, 0, 0]
      //  }
    })
}

/***
 * SOH 변화 그래프
 */
//   spline_area

var options = {
    chart: {
        height: 350,
        type: 'area',
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth',
        width: 3,
    },
    series: [{
        name: 'SOH',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0]
    }],
    colors: ['#5b73e8'],
    xaxis: {
        type: 'number',
        categories: [getToday(8), getToday(7), getToday(6), getToday(5), getToday(4), getToday(3),getToday(2), getToday(1),getToday(0)], 
    },
    grid: {
        borderColor: '#f1f1f1',
    }    
}

var chart2 = new ApexCharts(
    document.querySelector("#spline_area"),
    options
);


chart2.render();

    function SOHspline_areaGraphInit(graphData, graphData2){


        chart2.updateSeries([{
           data: graphData
        }])
        chart2.updateOptions([{
            xaxis: {
                type: 'number',
                categories: graphData2 
            }
         }])


    }
    function clearSOHspline_areaGraphInit(){


        chart2.updateSeries([{
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0]
        }])
       
        //chart2.xaxis = graphData2;
    }
 
    function getToday(diffday){
        var now = new Date();	// 현재 날짜 및 시간
        var date = new Date(now.setDate(now.getDate() - diffday));	// 어제

        var year = date.getFullYear();
        var month = ("0" + (1 + date.getMonth())).slice(-2);
        var day = ("0" + date.getDate()).slice(-2);
    
        return year + "-" + month + "-" + day;
    }