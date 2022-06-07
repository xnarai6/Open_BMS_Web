module.exports = {
    unitConvertWithComma: unitConvertWithComma,
    minuteFormat: minuteFormat,
    getIPAddress: getIPAddress
}

function replaceLastCommaWith(x, y) {
    return x.replace(/,(?=[^,]*$)/, "" + y + "");
}

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}

function unitConvertWithComma(convertString){
    var text = convertString.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

    var count = 0;
    var searchChar = ','; // 찾으려는 문자
    var pos = text.indexOf(searchChar); //pos는 0의 값을 가집니다.
    var firstPos = pos;

    var replace_text = text;

    while (pos !== -1) {
        count++;
        pos = text.indexOf(searchChar, pos + 1); // 첫 번째 , 이후의 인덱스부터 ,를 찾습니다.
    }

    var power = 0;
    var unit = "Wh";

    if(count == 0){
        power = parseFloat(replace_text).toFixed(2);
        unit = "Wh";
    }else if(count == 1){
        power = replace_text.replaceAt(firstPos,".");
        power = parseFloat(power.replace(",","")).toFixed(2);
        unit =  "KWh";
    }else if(count == 2){
        power = replace_text.replaceAt(firstPos,".");
        power = parseFloat(power.replace(",","")).toFixed(2);
        unit =  "MWh";
    }else if(count == 3){
        power = replace_text.replaceAt(firstPos,".");
        power = parseFloat(power.replace(",","")).toFixed(2);
        unit =  "GWh";
    }else if(count == 4){
        power = replace_text.replaceAt(firstPos,".");
        power = parseFloat(power.replace(",","")).toFixed(2);
        unit =  "TWh";
    }else if(count == 5){
        power = replace_text.replaceAt(firstPos,".");
        power = parseFloat(power.replace(",","")).toFixed(2);
        unit =  "PWh";
    }

    let returnData = {
        power : power,
        unit : unit
    }

    return returnData;

}


//분 -> 일 / 시간 / 분
function minuteFormat(minute){

    var returnData;

    if(minute > 60){
        var hour = parseInt(minute / 60);
        var min = minute % 60;
        if (hour > 24){
            var day = parseInt(hour / 24);
            var hour2 = hour % 24;
            returnData = day + "일 " + hour2 + "시간 " + min + "분";
        } else {
            returnData = hour + "시간 " + min + "분";
        }
    } else {
        returnData = minute + "분";
    }

    return returnData;
}

function getIPAddress() {

    var interfaces = require('os').networkInterfaces();
  
    for (var devName in interfaces) {
  
      var iface = interfaces[devName];
  
      for (var i = 0; i < iface.length; i++) {
  
        var alias = iface[i];
  
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
  
          return alias.address;
  
      }
  
    }
  
    return '0.0.0.0';
  
}