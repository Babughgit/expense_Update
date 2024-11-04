const bodyparser = require('body-parser');
const express=require('express');
const app=express();
const port=4000;
const bcrypt=require('bcrypt');
const session=require('express-session');
const path=require('path');

app.use(express.json());
app.use(bodyparser.urlencoded({extended:false}));
app.use('/public',express.static(path.join('public')));

//set up session management
app.use(session(
    {
        secret:'process.env.SESSION_KEY',
        resave:false,
        saveUninitialized:true,
        cookie:{secure:false}
    }
));
//imports routes
const authRoutes=require('./routes/authRoutes');
const expenseRoutes=require('./routes/expenseRoutes');
const pageRoutes = require('./routes/pageRoutes');
const premiumRoutes = require('./routes/premiumRoutes');
//use routes
app.use(authRoutes);
app.use(pageRoutes);
app.use(expenseRoutes);
app.use(premiumRoutes);

app.listen(port,function()
{
    console.log("server running");
})
