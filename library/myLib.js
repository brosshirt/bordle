function passwordHash(pw){ // in the future this is going to actually hash the password
    return pw;
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}
function emptyFields(obj){
    for (key of Object.keys(obj)){
        if (obj[key] === ''){
            return true;
        }
    }
    return false;
}


let functions = {
    passwordHash: passwordHash,
    capitalizeFirstLetter: capitalizeFirstLetter,
    validateEmail: validateEmail,
    emptyFields: emptyFields
}


module.exports = functions;