const express = require('express');
const methods = require('../method');
const router = express.Router();
let jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const common = require('../../lib/common');

// login user with jwt
router.post('/login', (req, res, next) => {
    const db = req.app.db;

    db.users.findOne({userEmail: common.mongoSanitize(req.body.email)}, (err, user) => {
        if(err){
            res.status(400).json({
                status: 400,
                message: 'A user with that email does not exist.',
                result: {}
            });
            return;
        }

        // check if user exists with that email
        if(user === undefined || user === null){
            res.status(400).json({
                status: 400,
                message: 'A user with that email does not exist.',
                result: {}
            });
        }else{
            // we have a user under that email so we compare the password
            bcrypt.compare(req.body.password, user.userPassword)
                .then((result) => {
                    if(result){
                        let token = jwt.sign(
                            {email: user.userEmail},
                            'secretkey',
                            (err, token) => {
                                res.status(200).json({
                                    status: 200,
                                    message: 'Login successful',
                                    result: {token: token}
                                });
                            });
                    }else{
                        // password is not correct
                        res.status(403).json({
                            status: 403,
                            message: 'Access denied. Check password and try again.',
                            result: {}
                        });
                    }
                });
        }
    });
});

// show orders
router.post('/products', methods.ensureToken, (req, res, next) => {
    const db = req.app.db;

    db.products.find({}).sort({'productAddedDate': -1}).limit(10).toArray((err, topResults) => {
        if(err){
            console.info(err.stack);
        }
        res.send({
            'status': 200,
            'message': '',
            result: {products: topResults}
        });
    });
});

module.exports = router;
