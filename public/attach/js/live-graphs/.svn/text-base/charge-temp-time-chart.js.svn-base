
    function chargeTempTimeGraphInit(tempMaxData, tempMinData, chargeData, disChargeData, xData2){

        var optionsLine1 = {
            series: [
                {
                    name:'최대온도',
                    type: 'line',
                    data: tempMaxData
    
                },
                {
                    name:'최소온도',
                    type: 'line',
                    data: tempMinData
    
                }
            ],
            labels : xData2,
            chart: {
            id: 'tw',
            group: 'social',
            type: 'line',
            height: 380,
            width: 8000,
            toolbar: {
                show: !1
            }
          },
          colors: ["#0100ff","#ff0000"],
          yaxis: {
            labels: {
              minWidth: 40
            }
          }
          };
    
          var chartLine1 = new ApexCharts(document.querySelector("#charge_temp_time_chart_dashed"), optionsLine1);
          chartLine1.render();
      
    }

    function chargeTempTimeGraphInit2(tempMaxData, tempMinData, chargeData, disChargeData, xData2){

        var optionsLine2 = {
            series: [
                {
                    name:'평균충전시간',
                    type: 'line',
                    data: chargeData
    
                },
                {
                    name:'평균 방전 시간',
                    type: 'line',
                    data: disChargeData
    
                }
            ],
            labels : xData2,
            chart: {
            id: 'tw',
            group: 'social',
            type: 'line',
            height: 380,
            width: 8000,
            toolbar: {
                show: !1
            }
          },
          colors: ["#abf200","#ffe400"],
          yaxis: {
            labels: {
              minWidth: 40
            }
          }
          };
    
          var chartLine2 = new ApexCharts(document.querySelector("#charge_temp_time_chart_dashed2"), optionsLine2);
          chartLine2.render();
    }

    function chargeTempTimeGraphUpdate(newData){

        data.shift();
        data.push(newData);

        chargetTempTimeChart.updateSeries([{
            data: data
        }])
    }