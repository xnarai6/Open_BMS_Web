const TYPE = {
    EMAIL: 'email', TEL: 'tel',
}

exports.TYPE = Object.freeze(TYPE);

exports.masking = (type, val, count) => {
    let result;

    if (type == TYPE.EMAIL) result = val.replace(new RegExp('.(?=.{0,' + (val.split('@')[0].length - 1 - count) + '}@)', 'g'), '*');
    if (type == TYPE.TEL) result = val.split('-').map((e, i) => i == 1 ? e.replace(/\d/gi, '*') : e).join('-');
    
    return result;
}
