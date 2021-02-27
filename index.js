const express = require('express');
const app = express();
const logger = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');

const router = require('./router/router');

const conn = require('express-myconnection');
const mysql = require('mysql');
const { Router } = require('express');

app.set('port', process.env.port || 7777);
app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:false}));
app.use(flash());

app.use(
    conn(mysql, {
        host: 'localhost',
        user:'root',
        password:'password',
        port:'3306',
        database:'ecommerce'
    },'single')
);

app.use(
    session({
        secret: 'bfifinance',
        resave: false,
        saveUnInitialized: true,
        cookie: {maxAge: 120000}
    })
);

// app.get('/', function(req, res){
//     res.send('Server is running on port ' + app.get('port'));
// });

app.get('/', router.home);
app.get('/home', router.home);
app.get('/login', router.login);
app.post('/login', router.login);
app.get('/add_product', router.addProduct);
app.post('/add_product', router.processAddProduct);
app.get('/edit_product/:id_product', router.editProduct);
app.post('/edit_product/:id_product', router.processEditProduct);
app.get('/delete_product/:id_product', router.deleteProduct);

app.listen(app.get('port'), function(){
    console.log('Server is running on port ' + app.get('port'));
});