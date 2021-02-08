const Validator = require("validator");
const isEmpty = require("is-empty");


module.exports=function validateRegisterInput(data) {
let errors={};

    data.username=!isEmpty(data.username) ? data.username : "";
    data.first_name = !isEmpty(data.first_name) ? data.first_name : "";
    data.last_name = !isEmpty(data.last_name) ? data.last_name : "";
    data.email = !isEmpty(data.email) ? data.email : "";
    data.password = !isEmpty(data.password) ? data.password : "";
    data.password2 = !isEmpty(data.password2) ? data.password2 : "";
    // data.location=!isEmpty(data.location) ? data.location: "";
    data.location = data.location ? !isEmpty(data.location.city) ? data.location : "" :"";
    data.location = data.location ? !isEmpty(data.location.country) ? data.location : "" :"";
// Name checks
    if (Validator.isEmpty(data.first_name)) {
        errors.first_name = "First Name is required.";
    }
    if (Validator.isEmpty(data.last_name)) {
        errors.last_name = "Last Name is required.";
    }
//    username check

    if(Validator.isEmpty(data.username)){
        errors.username="Username is required.";
    }
// Email checks
    if (Validator.isEmpty(data.email)) {
        errors.email = "Email is required";
    } else if (!Validator.isEmail(data.email)) {
        errors.email = "Email is invalid";
    }
// Password checks
    if (Validator.isEmpty(data.password)) {
        errors.password = "Password is required";
    }
    if (Validator.isEmpty(data.password2)) {
        errors.password2 = "Confirm password field is required";
    }
    if(data.location===""){
        errors.location="Location Must Be Selected"
    }
    if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
        errors.password = "Password must be at least 6 characters";
    }
    if (!Validator.equals(data.password, data.password2)) {
        errors.password2 = "Passwords must match";
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };


};
