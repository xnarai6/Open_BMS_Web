const crypto = require("crypto");

module.exports = {
    encdec: {
        encWithKey: encWithKey,
        decWithKey: decWithKey,
    },
    hmac: {
        hashWithKey: hashWithKey,
    },
    password: {
        create: createPassword,
        validate: validatePassword,
    },
    random: {
        create: createRandom
    },
    createPassword: createPassword,
    validatePassword: validatePassword,
    encryptGCM: encryptGCM,
    decryptGCM: decryptGCM
}

// enc with key
function encWithKey(info, keyStr, ivStr) {

    let key = Buffer.from(crypto.createHash("md5").update(keyStr).digest("hex"), "hex");
    let iv = Buffer.from(crypto.createHash("md5").update(ivStr).digest("hex"), "hex");

    let cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
    let cipheredPlaintext = cipher.update(info, "utf8", "base64");
    cipheredPlaintext += cipher.final("base64");

    return cipheredPlaintext;
}

// dec with key
function decWithKey(info, keyStr, ivStr) {

    let key = Buffer.from(crypto.createHash("md5").update(keyStr).digest("hex"), "hex");
    let iv = Buffer.from(crypto.createHash("md5").update(ivStr).digest("hex"), "hex");

    try {
        let decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
        let decipheredPlaintext = decipher.update(info, "base64");
        decipheredPlaintext += decipher.final();

        return decipheredPlaintext;
    } catch (error) {
        console.log(error);
        return "";
    }
}

// create hash value
function hashWithKey(message, hmacKey) {
    
    let hash = crypto.createHmac("SHA256", hmacKey).update(message).digest('base64');

    return hash;
}

// create paasword
function createPassword(password) {
    try {
        let inputPassword = password;
        let salt = Math.round((new Date().valueOf() * Math.random())) + '';
        let hashPassword = crypto.createHash('sha512').update(inputPassword + salt).digest('hex');

        return { salt: salt, hashPassword: hashPassword }
    } catch (e) {
        console.log(e);
        return null;
    }
}

// check password
function validatePassword(password, salt) {
    try {
        let inputPassword = (password) ? password : '';
        let inputSalt = (salt) ? salt : '';
        let hashPassword = crypto.createHash('sha512').update(inputPassword + inputSalt).digest('hex');

        return hashPassword;
    } catch (e) {
        console.log(e);
        return null;
    }
}

// create random string
function createRandom(len) {

    // make random string
    let strSet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    let result = "";
    
    for(let i = 0; i < len; i++) {
        let n = Math.floor(Math.random() * strSet.length);
        result += strSet.substring(n, n + 1);
    }

    return result
}

function encryptGCM(targetText) {
    let encIvTargetText;
		
    if(!targetText) return encIvTargetText;
    
    try {
        let ivBytes = crypto.randomBytes(12);

        let cipher = crypto.createCipheriv("aes-128-gcm", 'Ym86XKV8FDaB7qz5', ivBytes);
        let encIvTargetBytes = ivBytes;
            encIvTargetBytes = Buffer.concat([encIvTargetBytes, cipher.update(targetText, 'utf8')]);
            encIvTargetBytes = Buffer.concat([encIvTargetBytes, cipher.final()]);
            encIvTargetBytes = Buffer.concat([encIvTargetBytes, cipher.getAuthTag()]);

        encIvTargetText = encIvTargetBytes.toString('base64');
    } catch(e) {
        console.log(e);
        return null;
    }
    
    return encIvTargetText;
}

function decryptGCM(encIvTargetText) {
    let targetText;
		
    if(!encIvTargetText) return targetText;
    
    try {
        let encIvTargetBytes = Buffer.from(encIvTargetText, 'base64');

        let ivBytes = encIvTargetBytes.slice(0, 12);
        let encTargetBytes = encIvTargetBytes.slice(12, encIvTargetBytes.length - 16);
        let tag = encIvTargetBytes.slice(encIvTargetBytes.length - 16);

        let cipher = crypto.createDecipheriv('aes-128-gcm', 'Ym86XKV8FDaB7qz5', ivBytes);
        cipher.setAuthTag(tag);

        targetText = cipher.update(encTargetBytes, null, 'utf8');
        targetText += cipher.final('utf8');
    } catch(e) {
        console.log(e);
        return null;
    }
    
    return targetText;
}