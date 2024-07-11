const mongoose= require('mongoose');
const schema= mongoose.Schema;

const signupSchema= new schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    username:{
        type:String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    repassword:{
        type: String,
        required: true
    },
    token:{
        type:String,
        default:'',
    }
});

const signup = mongoose.model("user",signupSchema);
module.exports = signup;