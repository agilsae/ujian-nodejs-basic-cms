const multer = require('multer');

//------client-----
exports.home = function (req, res) {
    req.getConnection(function (err, connect){
        var query = connect.query(`SELECT * FROM product`, function(err, rows){
            if (err){
                console.log('Err', err);
            }

            res.render('index',{
                data:rows
            });
        });
    })
}

exports.detailProduct = function(req, res) {
    var id_produk = req.params.id_product;

    req.getConnection(function(err, connect){
        var query = connect.query(`SELECT * FROM product WHERE id_porduct = ${id_produk}`, function(err, rows){
            if (err){
                console.log('Err', err);
            }

            res.render('single',{
                data:rows
            });
        });
    })
}




//------admin-------

exports.login = function(req, res){
    let message = '';
    let session = req.session;
    let md5 = require('md5');

    if (req.method == 'POST'){
        let post = req.body;
        let name = post.username;
        let pass = md5(post.password);

        req.getConnection(function(err, connect){
            let sql = `SELECT id_admin, username, name, admin_level FROM admin_tbl where username = '${name}' AND password = '${pass}'`;
            let query = connect.query(sql, function(err, results){
                if (results.length) {
                    req.session.adminId = results[0].id_admin;
                    req.session.admin = results[0];
                    console.log(results[0].id_admin);
                    res.redirect('/admin/home');
                }else {
                    message = 'Username or Password Incorrect! Please try again.';
                    res.render('/admin/index', {
                        message: message
                    });
                }
            });
        });
    }else{
        res.render('./admin/index',{
            message: message
        });
    }   
}

exports.admin = function (req, res){
    var admin = req.session.admin;
    var adminId = req.session.adminId;
    console.log('id.admin =' + adminId);

    if (adminId == null){
        res.redirect('/admin/login');
        return;
    }

    req.getConnection(function(err, connect){
        var sql = `SELECT * FROM product ORDER BY createdate DESC`;

        var query = connect.query(sql, function(err, results){
            //jika koneksi dan query berhasil, tampilkan home admin
            res.render('./admin/home', {
                pathname: 'home',
                data: results
            });
        });
    });
}

exports.addProduct = function (req, res){
    var admin = req.session.admin;
    var adminId = req.session.adminId;
    console.log('id.admin =' + adminId);

    if (adminId == null){
        res.redirect('/admin/login');
        return;
    }

    res.render('./admin/home',{
        pathname: 'add_product'
    });
}

exports.processAddProduct = function(req, res){
    var storage = multer.diskStorage({
        destination: './public/product_images',
        filename: function(req, file, callback){
            callback(null, file.originalname);
        }
    });

    var upload = multer({ storage: storage}).single('image');
    var date = new Date(Date.now());

    upload(req, res, function(err){
        if (err) {
            return res.end('Error uploading image');
        }

        console.log(req.file);
        console.log(req.body);

        req.getConnection(function(err, connect){
            //tangkap nilai atau value dr body (atribut name)
            var post = {
                nama_produk: req.body.nama_product,
                harga_product: req.body.harga_product,
                des_product: req.body.des_product,
                gambar_produk: req.file.filename,
                createdate: date
            }

            console.log(post); //utk menampilkan data post di console

            var sql = `INSERT INTO product SET ?`;
            var query = connect.query(sql, post, function(err, results){
                if (err) {
                    console.log('Error Input product: %s', err);
                }

                req.flash('info','Succes add data! Data has been added');
                res.redirect('/admin/home');
            });
        });
    });
}

exports.editProduct = function (req, res){
    var id_product = req.params.id_product;
    var admin = req.session.admin;
    var adminId = req.session.adminId;
    console.log('id.admin =' + adminId);

    if (adminId == null){
        res.redirect('/admin/login');
        return;
    }

    req.getConnection(function(err, connect){
        var sql = `SELECT * FROM product WHERE id_product = ${id_product}`;

        var query = connect.query(sql, function(err, results){
            if (err) {
                console.log('Error Show product: %s', err);
            }

            res.render('./admin/home',{
                id_product: id_product,
                pathname: 'edit_product',
                data: results
            });
        });       
    });

   
}

exports.processEditProduct = function(req, res) {
    var id_product = req.params.id_product;

    var storage = multer.diskStorage({
        destination: './public/product_images',
        filename: function (req, file, callback){
            callback(null, file.originalname);
        }
    });

    var upload = multer({storage: storage}).single('image');
    var date = new Date(Date.now());

    upload(req, res, function(err){
        if (err) {
            var image = req.body.image_old;
            console.log('error uploading image!');
        } else if (req.file == undefined){
            var image = req.body.image_old;
        } else {
            var image = req.file.filename;
        }

        console.log(req.file);
        console.log(req.body);

        req.getConnection(function(err, connect){
            var post = {
                nama_produk: req.body.nama_product,
                harga_product: req.body.harga_product,
                des_product: req.body.des_product,
                gambar_produk: image,
                createdate: date
            }

            console.log(post);

            var sql = `UPDATE product SET ? WHERE id_product = ?`;

            var query = connect.query(sql, [post, id_product], function(err, results){
                if (err) {
                    console.log('Error Edit product', err);
                }

                req.flash('info','Succes edit data! Data has been edited');
                res.redirect('/admin/home');
            })
        });
    });
}

exports.deleteProduct = function(req, res) {
    var id_product = req.params.id_product;
    var admin = req.session.admin;
    var adminId = req.session.adminId;
    console.log('id.admin =' + adminId);

    if (adminId == null){
        res.redirect('/admin/login');
        return;
    }

    req.getConnection(function(err, connect){
        
        var query = connect.query(`DELETE FROM product WHERE id_product = ${id_product}`, function(err, results){
           if (err) {
               console.log('Error delete product: %s', err);
           }
           req.flash('info','Data has been deleted');
           res.redirect('/admin/home');
        })
    });
}