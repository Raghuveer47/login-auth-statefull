const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const ejs = require('ejs')
const dotEnv = require("dotenv");
const user = require('./model/User')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs');
const User = require('./model/User');


 //middleware
app.use(express.json()) 
app.use(express.static('public'))
app.set('view engine', 'ejs') //ejs
app.use(express.urlencoded({extended:true})) //for geting form examples

const checkAuth = (req,res,next)=>{
    if(req.session.isAuthenticated){
        next()
    }else{
        res.redirect('/login')
    }
}


app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

dotEnv.config();


mongoose.connect(process.env.MONGO_URI)
.then(
    ()=> console.log('connected')
).catch(err => console.log(err))


// creating store in session mongodb
var store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'mySessions'
  });
  app.use(session({
    secret:"this is a secret key",
    resave:false,
    saveUninitialized:true,
    store: store
}))  
 





// basic routes
app.get('/datavalley', (req,res)=>{
    res.render('sample')
})

app.get('/register', (req,res)=>{
    res.render('register')
})

app.get('/login', (req,res)=>{
    res.render('login')
})

app.get('/home', checkAuth, (req,res)=>{
    res.render('home')
})


//logut function 
app.get('/logout', (req,res)=>{
    req.session.destroy(err =>{
        if(err){
            console,log(err)
            return res.redirect('/home')
        }
        res.redirect('login')
    })
})


app.post('/register', async(req,res)=>{
    const{username, email, password} = req.body

    let founduser = await User.findOne({email})
    if(founduser){
        return res.render('register')
      
    }

    const hashedPassword = await bcrypt.hash(password, 11)

    Newuser = new user({
        username,
        email,
        password:  hashedPassword
    })
    await Newuser.save()
    res.redirect('/login')
    req.session.person = user.username
})

app.post('/user-login', async(req,res)=>{
    const {email, password} = req.body

    const user= await User.findOne({email})

    if(!user){
        return res.redirect('/register')
    }

    const checkpswrd = await bcrypt.compare(password, user.password)

    if(!checkpswrd){
        return res.redirect('/register')
    }
    req.session.isAuthenticated = true
    res.redirect('/home')

})



app.listen(3000, ()=>{
    console.log('server is running')
})