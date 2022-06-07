
options = {
chart: {
    height: 339,
    type: "line",
    stacked: !1,
    toolbar: {
        show: !1
    }
},
stroke: {
    width: [3, 3, 3],
    curve: "smooth"
},
plotOptions: {
    bar: {
        columnWidth: "30%"
    }
},
colors: ["#34c38f", "#f1b44c", "#5b73e8"],
series: [{
    data: []
}],
fill: {
    opacity: [.85, .85, 1],
    gradient: {
        inverseColors: !1,
        shade: "light",
        type: "vertical",
        opacityFrom: .85,
        opacityTo: .55,
        stops: [0, 100, 100, 100]
    }
},
labels: [],
markers: {
    size: 0
},
xaxis: {

},
yaxis: {

},
tooltip: {
    shared: !0,
    intersect: !1,
    y: {
        formatter: function(e) {
            return e
        }
    }
},
grid: {
    borderColor: "#f1f1f1"
}
};
(chart = new ApexCharts(document.querySelector("#dashboard-chart"), options)).render();

var data = []
function dashGraphInit(chrgData, dischrgData, standbyData, dateData){

    chart.updateSeries([{type: 'line'}]);

    // chart.updateSeries([{
    //     name:'충전',
    //     type: 'line',
    //     data: chrgData
    // },{
    //     name:'방전',
    //     type: 'line',
    //     data: dischrgData
    // },{
    //     name:'대기시간',
    //     type: 'line',
    //     data: standbyData
    // }])

    chart.updateOptions({
        chart: {
            height: 339,
            type: "line",
            stacked: !1,
            toolbar: {
                show: !1
            }
        },
        series: [{
        name: '충전',
        data: chrgData
      }, {
        name: '방전',
        data: dischrgData
      }, {
        name: '대기시간',
        data: standbyData
      }],
        
      responsive: [{
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
            offsetX: -10,
            offsetY: 0
          }
        }
      }],
      plotOptions: {
        bar: {
          borderRadius: 8,
          horizontal: false,
        },
      },
      xaxis: {
        // type: 'datetime',
        categories: dateData
      }
      
      });
}


//수정
function dashGraphInit2(goodData, normData, badData, monthData){

    // chart.updateSeries([{
    //     name:'SOC',
    //     type: 'line',
    //     data: socData
    // }])

    chart.updateSeries([{type: 'bar'}]);

    chart.updateOptions({
        chart: {
            type: 'bar',
            height: 350,
            stacked: true,
            toolbar: {
              show: true
            },
            zoom: {
              enabled: true
            }
          },
        series: [{
        name: '나쁨',
        data: badData
      },{
        name: '평균',
        data: normData
      },{
        name: '좋음',
        data: goodData
      }],
      colors: ["#f1b44c", "#5b73e8", "#34c38f"],
      responsive: [{
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
            offsetX: -10,
            offsetY: 0
          }
        }
      }],
      plotOptions: {
        bar: {
          borderRadius: 8,
          horizontal: false,
        },
      },
      xaxis: {
        type: 'datetime',
        categories: monthData,
      }
      });
}

function dashGraphUpdate(newData){

    data.shift();
    data.push(newData);

    chart.updateSeries([{
        data: data
    }])
}