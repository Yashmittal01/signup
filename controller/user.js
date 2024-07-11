const signupModel= require("../models/signup");
const express= require ("express");
const app = express();
const bodyParser= require('body-parser');
app.use(bodyParser.urlencoded({ extended: false}));
const jwt = require('jsonwebtoken');
const nodemailer= require('nodemailer');
const randomString= require('randomstring');
const config = require("../config");

exports.signup = async (req,res)=>{
    const {email}= req.body;
    const response= await signupModel.findOne({email});
        if(!response){
            const newUser= new signupModel({
                name:req.body.name,
                email:req.body.email, 
                username:req.body.username,
                password: req.body.password,
                repassword:req.body.repassword
            })
            await newUser.save().then(()=>{
            res.redirect("/login");
            }).catch((err)=>{
            res.send(err);
        })
    }
    
    else{
        res.status(400).json({ message: 'Email already exists. Please use a different email.' });
    }
};

module.exports.login= (req,resp)=>{
    signupModel.findOne({username: req.body.username}).then(res =>{
        if(res.password!==req.body.password){
            resp.send({code:404, message:"incorrect password"});
        }
        else{
            resp.render("home.ejs",{res});
        }
    }).catch((err)=>{
        resp.send("Invalid User");
    });
}



const sendmail = async(name, email, token)=>{
    try{
        const transporter=nodemailer.createTransport({
            service: "gmail",
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user: config.email.user,
                pass: config.email.pass
            }
        });
        const mailOptions= {
            from: config.email.user,
            to: email,
            subject: "reset password",
            html: 'Hii you can reset your password <a href="http://127.0.0.1:3000/reset-password?token='+token+'"> click here </a>'
        }
        transporter.sendMail(mailOptions,function(err,info){
            if(err){
                res.status(200).json({ message: 'something went wrong' });
            }
            else{
                console.log("send",info.response);
            }
        });
    }
    catch(err){
        res.status(400).json({ message: 'something went wrong' });
    }
}

module.exports.forget= async(req,res)=>{
    const {email}= req.body;
    const email1= req.body.email
    try{
        const oldUser = await signupModel.findOne({email});
        if(!oldUser){
            return res.send("Invalid User");
        }
        else{
            const gstring= randomString.generate();
            await signupModel.updateOne({email:email},{$set:{token:gstring}});
            sendmail(oldUser.name, oldUser.email, gstring);
            res.redirect("/login");
        }
    }
    catch(err){

    }
}

module.exports.reset= async(req,res)=>{
    try{
        const token= req.query.token;
        const tokendata = await signupModel.findOne({token: token});
        if(tokendata){
            const token = req.query.token;
            res.render("reset.ejs",{token});
        }
        else{
            res.status(400).json({ message: 'link has been expired' });
        }
    }catch(err){
        res.send("Not Valid");
    }
}

module.exports.postreset= async(req,res)=>{
    try {
        const token = req.body.token;
        const newpassword = req.body.password;
        const tokendata = await signupModel.findOne({token: token});
        const suc = await signupModel.findByIdAndUpdate({_id:tokendata._id},{$set:{password:newpassword, token:''}});
        res.redirect("/login");
    }catch(err){
        res.status(200).json({ message: 'something went wrong' });
    }
}