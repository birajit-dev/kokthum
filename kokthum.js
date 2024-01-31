const express = require('express');
const exphbs = require('express-handlebars');
//var sassMiddleware = require('node-sass-middleware')
var path = require('path');
const app = express();
const sessions = require('express-session');
const routes = require('./server/routes/allroute');
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


const { createProxyMiddleware } = require('http-proxy-middleware'); // Import the proxy middleware


const oneDay = 1000 * 60 * 60 * 24;
app.use(cookieParser());



const proxyOptions = {
  target: 'https://netalk.in', // The website you want to proxy
  changeOrigin: true, // Changes the "Origin" header to the target URL
  onProxyRes: (proxyRes, req, res) => {
    // Modify response headers if needed
  },
};

const proxy = createProxyMiddleware(proxyOptions);

app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

app.engine('hbs', exphbs.engine({
    defaultLayout: 'main',
    
    helpers: {
        todaysDate:(date) => new Date(date),   
        helpers: require(__dirname +"/public/javascripts/helpers.js").helpers,

      },
    extname: '.hbs'
  }));

app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//console.log( __dirname + '/public/scss');
// app.use(
//   sassMiddleware ({
//       src: __dirname + '/public/scss', 
//       dest: __dirname + '/public',
//       debug: true,       
//   })
// );   
app.use(express.static(path.join(__dirname, 'public')));


app.use('/proxy', proxy); // This will proxy requests to "/proxy" to the target



app.use('/', routes);
app.use('*', (req, res) => {
    res.status(404).render('404');
  });




// port where app is served
app.listen(8080, () => {
    console.log('The web server has started on port 4000');
});