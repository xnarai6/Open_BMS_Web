const TYPE = {
    STR: 'str', NUM: 'num',

    ID: 'id', PW: 'pw', NAME: 'name', EMAIL: 'email', TEL: 'tel',
}

exports.TYPE = Object.freeze(TYPE);

exports.chkValidation = (type, val) => {
    let msg;
    
    if (type == TYPE.ID && !new RegExp('^[A-Za-z0-9]{5,15}$').test(val)) msg = '아이디는 영문자 및 숫자를 5자 이상 15자 이하로 입력해주세요';
    if (type == TYPE.PW && !new RegExp('^[A-Za-z0-9~!@#$%^&*]{6,20}$').test(val)) msg = '비밀번호는 영문자, 숫자 및 특수문자를 6자 이상 20자 이하로 입력해주세요';
    if (type == TYPE.NAME && !new RegExp('^[A-Za-z0-9가-힣]{1,20}$').test(val)) msg = '이름은 영문자, 한글 및 숫자를 1자 이상 20자 이하로 입력해주세요';
    if (type == TYPE.EMAIL && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val)) msg = '올바른 이메일을 입력해주세요';
    if (type == TYPE.TEL && !/^01(?:0|1|[6-9])-(?:\d{3}|\d{4})-\d{4}$/.test(val)) msg = '올바른 휴대폰번호를 입력해주세요';

    // if (type == 'is' && value != undefined && value != '') return true;
	// if (type == 'biz' && checkCorporateRegiNumber(value)) return true;
	// if (type == 'limit' && new RegExp('^.{0,' + max + '}$').test(value)) return true;
	// if (type == 'between' && new RegExp('^.{' + min + ',' + max + '}$').test(value)) return true;
	// if (type == 'number' && new RegExp('^[0-9]{' + min + ',' + max + '}$').test(value)) return true;
    // if (type == 'tel' && /^\d{2,3}-\d{3,4}-\d{4}$/.test(value)) return true;
    // if (type == 'email' && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) return true;
    // if (type == 'password' && new RegExp('^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[$@$!%*#?&])[A-Za-z0-9$@$!%*#?&]{' + min + ',' + max + '}$').test(value)) return true;
    
    return msg;
}
