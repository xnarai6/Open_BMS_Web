function syncAjax2(headerType, type, url, data) {
	let result;
	let ajaxObject = {}
	let defaultObject = { type: type, url: url, async: false, success: function(data) { result = data } }
	
	if(headerType == "json") ajaxObject = Object.assign(defaultObject, { contentType: "application/json", data: JSON.stringify(data) });
	else if(headerType == "file") ajaxObject = Object.assign(defaultObject, { enctype: "multipart/form-data", processData: false, contentType: false, cache: false, data: data });
	else ajaxObject = Object.assign(defaultObject, { data: data });
    
    $.ajax(ajaxObject);
	
	return result;
}

function syncAjax(type, url, data) {
    let result;

    $.ajax({
        type: type,
        url: url,
        data: data,
        async: false,
        success: function (data) {
            result = data;
        }
    });

    return result;
}

function fillZero(width, str) {
    return str.length >= width ? str:new Array(width - str.length+1).join('0') + str;
}

function printTime() {
    var clock = document.getElementById("clock");
    if (!clock) return false;

    var now = new Date();

    clock.innerHTML = now.getFullYear() + "/" +
        fillZero(2,(now.getMonth()+1).toString()) + "/" +
        fillZero(2,now.getDate().toString()) + "  " +
        fillZero(2,now.getHours().toString()) + ":" +
        fillZero(2,now.getMinutes().toString()) + ":" +
        fillZero(2,now.getSeconds().toString()) + "";

    setTimeout("printTime()", 1000);
}

function valCheck(type, value) {
    if (type == "id" && /^.{5,}$/.test(value))
        return true;
    if (type == "email" && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value))
        return true;
    if (type == "password" && /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@$%^&*])[A-Za-z\d!@$%^&*]{8,}$/.test(value))
        return true;
    if (type == "is" && value != "")
        return true;
    if (type == "positive" && value != "" && Number(value) > 0)
        return true;
    if (type == "tel" && /^\d{2,3}-\d{3,4}-\d{4}$/.test(value))
        return true;

    return false;
}

function autoHypenTel(str) {
    str = str.replace(/[^0-9]/g, '');
    var tmp = '';
  
    if (str.substring(0, 2) == 02) {
      // 서울 전화번호일 경우 10자리까지만 나타나고 그 이상의 자리수는 자동삭제
      if (str.length < 3) {
        return str;
      } else if (str.length < 6) {
        tmp += str.substr(0, 2);
        tmp += '-';
        tmp += str.substr(2);
        return tmp;
      } else if (str.length < 10) {
        tmp += str.substr(0, 2);
        tmp += '-';
        tmp += str.substr(2, 3);
        tmp += '-';
        tmp += str.substr(5);
        return tmp;
      } else {
        tmp += str.substr(0, 2);
        tmp += '-';
        tmp += str.substr(2, 4);
        tmp += '-';
        tmp += str.substr(6, 4);
        return tmp;
      }
    } else {
      // 핸드폰 및 다른 지역 전화번호 일 경우
      if (str.length < 4) {
        return str;
      } else if (str.length < 7) {
        tmp += str.substr(0, 3);
        tmp += '-';
        tmp += str.substr(3);
        return tmp;
      } else if (str.length < 11) {
        tmp += str.substr(0, 3);
        tmp += '-';
        tmp += str.substr(3, 3);
        tmp += '-';
        tmp += str.substr(6);
        return tmp;
      } else {
        tmp += str.substr(0, 3);
        tmp += '-';
        tmp += str.substr(3, 4);
        tmp += '-';
        tmp += str.substr(7);
        return tmp;
      }
    }
  
    return str;
  }

  $('.phoneInput').keyup(function (event) {
    event = event || window.event;
    var _val = this.value.trim();
    this.value = autoHypenTel(_val);
  });

  function adjustHeight(textareaId) {
    var textEle = textareaId
    textEle[0].style.height = 'auto';
    var textEleHeight = textEle.prop('scrollHeight') + 10;
    textEle.css('height', textEleHeight);
};

// const swalWithBootstrapButtons = Swal.mixin({
//   customClass: {
//     confirmButton: 'btn btn-success',
//     cancelButton: 'btn btn-danger'
//   },
//   buttonsStyling: false
// })

function makeAlertObj(type, msg) {
	
	let result = {};
	
	if(type == "warning") {
		result = {
			icon: "warning",
			title: msg,
			text: "",
			confirmButtonColor: "#3085d6",
			confirmButtonText: "OK",
			confirmButtonClass: "btn btn-warning mx-1"
		}
	}
	
	if(type == "upload") {
		result = {
			icon: "warning",
			title: msg,
			text: "",
			buttonsStyling: false,
			reverseButtons: true,
			showCancelButton: true,
			cancelButtonColor: "#d33",
			cancelButtonClass: "btn btn-danger mx-1",
			confirmButtonColor: "#3085d6",
			confirmButtonText: "Yes, Upload!",
			confirmButtonClass: "btn btn-warning mx-1"
		}
	}
	
	if(type == "delete") {
		result = {
			icon: "warning",
			title: msg,
			text: "",
			buttonsStyling: false,
			reverseButtons: true,
			showCancelButton: true,
			cancelButtonColor: "#d33",
			cancelButtonClass: "btn btn-danger mx-1",
			confirmButtonColor: "#3085d6",
			confirmButtonText: "Yes, Delete!",
			confirmButtonClass: "btn btn-warning mx-1"
		}
	}

// 여기서부터는 swalWithBootstrapButtons.fire(makeAlertObj(type,msg)) 로 작동한다.
  if(type == "error") {
		result = {
      icon: "error",
			title: msg,
			text: ""
		}
	}
	
	if(type == "success") {
		result = {
			icon: "success",
			title: msg,
			text: ""
		}
	}

  if(type == "warning") {
		result = {
      icon: "warning",
			title: msg,
			text: ""
		}
	}

  if(type == "question") {
		result = {
      icon: "question",
			title: msg,
			text: ""
		}
	}
	
	return result;
}

function delHangle(evt){

  var objTarget = evt.srcElement || evt.target;
  var _value = event.srcElement.value;
  if(/[ㄱ-ㅎ ㅏ-ㅡ가-핳]/g.test(_value)){
    objTarget.value = null;
  }

}

//소수점 입력 제한 관련 메서드
function isNumberKey(evt) {
  var charCode = (evt.which) ? evt.which : event.keyCode;
  if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;

  // Textbox value       
  var _value = event.srcElement.value;       

  // 소수점(.)이 두번 이상 나오지 못하게
  var _pattern0 = /^\d*[.]\d*$/; // 현재 value값에 소수점(.) 이 있으면 . 입력불가
  if (_pattern0.test(_value)) {
      if (charCode == 46) {
          return false;
      }
  }

  // 10000000000 이하의 숫자만 입력가능
  var _pattern1 = /^\d{10}$/; // 현재 value값이 10자리 숫자이면 . 만 입력가능
  if (_pattern1.test(_value)) {
      if (charCode != 46) {
          alert("10000000000 이하의 숫자만 입력가능합니다");
          return false;
      }
  }

  // 소수점 다섯째자리까지만 입력가능
  var _pattern2 = /^\d*[.]\d{5}$/; // 현재 value값이 소수점 다섯째짜리 숫자이면 더이상 입력 불가
  if (_pattern2.test(_value)) {
      alert("소수점 다섯째자리까지만 입력가능합니다.");
      return false;
  }     

  return true;
}

//소수점 입력 제한 관련 메서드
function isNumberKeyForPercent(evt) {
  var charCode = (evt.which) ? evt.which : event.keyCode;
  if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;

  // Textbox value       
  var _value = event.srcElement.value;       

  // 소수점(.)이 두번 이상 나오지 못하게
  var _pattern0 = /^\d*[.]\d*$/; // 현재 value값에 소수점(.) 이 있으면 . 입력불가
  if (_pattern0.test(_value)) {
      if (charCode == 46) {
          return false;
      }
  }

  // 소수점 둘째자리까지만 입력가능
  var _pattern2 = /^\d*[.]\d{2}$/; // 현재 value값이 소수점 다섯째짜리 숫자이면 더이상 입력 불가
  if (_pattern2.test(_value)) {
      alert("소수점 둘째자리까지만 입력가능합니다.");
      return false;
  }     

  return true;
}

$(function() {
    printTime();
    
    $('.tel').keyup(function(event) {
        var key = event.charCode || event.keyCode || 0;
        $text = $(this);
        if (key !== 8 && key !== 9) {

            $(this).val( $(this).val().replace(/[^0-9]/g, "").replace(/(^02|^0505|^1[0-9]{3}|^0[0-9]{2})([0-9]+)?([0-9]{4})$/,"$1-$2-$3").replace("--", "-") );

        }
    
        return (key == 8 || key == 9 || key == 46 || (key >= 48 && key <= 57) || (key >= 96 && key <= 105));          
    });
});