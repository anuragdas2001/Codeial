const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const env = require('./config/environment');
const logger = require('morgan');
const port = 8000;
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/mongoose');
const MongoStore = require('connect-mongo'); 
// const sassMiddleware = require('sass');
// const sassMiddleware = require('node-sass-middleware');

// used for session cookie
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const passportJwt = require('./config/passport-jwt-strategy');
const passportgoogle = require('./config/passport-google-oauth2-strategy');
const flash = require('connect-flash');
const customMWare = require('./config/middleware');
//Setup the chat Server to be used with Socket.io
const cors = require('cors');
// const chatServer = require('http').Server(app);
// const chatSockets = require('./config/chat_sockets').chatSockets(chatServer);

// CORS configuration
// const corsOptions = {
//     origin: 'http://51.20.121.166:8000', // Replace with the actual origin of your client application
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true,
//     optionsSuccessStatus: 204
// };
// app.use(cors(corsOptions));

const chatServer = require('http').createServer(app);
const options = {
    cors: {
        origin: "http://51.20.121.166",
        methods: ["GET", "POST"]
      }
};
const chatSockets = require('./config/chat_sockets').chatSockets(chatServer, options);
chatServer.listen(5000, function(){
    console.log('chat server is listening on port 5000');
});


// chatServer.listen(5000);
// console.log('Chat Server is listening on port 5000');
app.use(cors());
app.use(express.urlencoded());

app.use(cookieParser());

app.use(express.static(env.asset_path));
//make the uploads path available to the browser
app.use('/uploads',express.static(__dirname + '/uploads'));

app.use(logger(env.morgan.mode,env.morgan.options));


app.use(expressLayouts);
// extract style and scripts from sub pages into the layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);




// set up the view engine
app.set('view engine', 'ejs');
app.set('views', './views');


app.use(session({
    name: 'codeial',
    // TODO change the secret before deployment in production mode
    secret: env.session_cookie_key,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 100)
    },
    store: MongoStore.create({
        mongoUrl: 'mongodb://127.0.0.1:27017/codeial_development',
        autoRemove:'disabled'
      })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);
app.use(flash());
app.use(customMWare.setFlash);
// use express router
app.use('/', require('./routes'));


app.listen(port, function(err){
    if (err){
        console.log(`Error in running the server: ${err}`);
    }

    console.log(`Server is running on port: ${port}`);
});
