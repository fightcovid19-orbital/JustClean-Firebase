const isEmpty = string => {
    if(string.trim() === '') {
        return true;
    } else {
        return false;
    }
};

const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) {
        return true;
    } else {
        return false;
    }
};

exports.validateSignupData = data => {
    // Validation
    let errors = {};
    //email
    if(isEmpty(data.email)) {
        errors.email = 'Must not be empty';
    } else if(!isEmail) {
        errors.email = 'Must be a valid email address';
    }

    //password
    if (isEmpty(data.password)) {
        errors.password = "Must not be empty";
    }

    //check type
    if (isEmpty(data.type)) {
        errors.type = "Must not be empty";
    } else if (data.type !== 'cleaner' && data.type !== 'customer') {
        errors.type = "Wrong type of User given";
    }

    // comfirm password
    if (data.comfirmPassword !== data.password) {
        errors.comfirmPassword = "Password not match";
    }

    //Cleaner Name
    if (isEmpty(data.userName)) {
        errors.userName = "Must not be Empty";
    }

    return { 
        errors,
        valid: Object.keys(errors).length === 0
    }
};

exports.validateLoginData = data => {
    // Validation
    let errors = {};
    //email
    if(isEmpty(data.email)) {
        errors.email = 'Must not be empty';
    } else if(!isEmail) {
        errors.email = 'Must be a valid email address';
    }

    if (isEmpty(data.type)) {
        errors.type = "Must not be empty";
    } else if (data.type !== 'cleaner' && data.type !== 'customer') {
        errors.type = "Wrong type of User given";
    }

    //password
    if (isEmpty(data.password)) {
        errors.password = "Must not be empty";
    }

    return { 
        errors,
        valid: Object.keys(errors).length === 0
    }
};

exports.reduceUserDetails = data => {
    let userDetails = {};

    if(!isEmpty(data.bio.trim())) {
        userDetails.bio = data.bio;
    }

    if(!isEmpty(data.location.trim())) {
        userDetails.location = data.location;
    }

    return userDetails;
};