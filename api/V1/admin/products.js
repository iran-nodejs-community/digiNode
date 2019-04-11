const express = require('express');
const methods = require('../../method');
const router = express.Router();
const cors = require('cors');
const common = require('../../../lib/common');
const colors = require('colors');

// show products
router.get('/', methods.ensureToken, cors(), (req, res, next) => {
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

// insert into products
router.post('/insert', methods.ensureToken, cors(), (req, res, next) => {
    const db = req.app.db;

    let doc = {
        productPermalink: req.body.permalink,
        productTitle: common.cleanHtml(req.body.title),
        productPrice: req.body.price,
        productDescription: common.cleanHtml(req.body.description),
        productPublished: req.body.published,
        productTags: req.body.tags,
        productOptions: common.cleanHtml(req.body.optJson),
        productComment: common.checkboxBool(req.body.comment),
        productAddedDate: new Date(),
        productStock: req.body.stock ? parseInt(req.body.stock) : null
    };

    db.products.count({'productPermalink': req.body.permalink}, (err, product) => {
        if(err){
            console.info(err.stack);
        }
        if(product > 0 && req.body.permalink !== ''){
            // permalink exits
            const message = 'لینک در حال حاضر وجود دارد یکی را انتخاب کنید';

            res.send({
                'status': 422,
                'message': message,
                result: {}
            });
        }else{
            db.products.insert(doc, (err, newDoc) => {
                if(err){
                    console.log(colors.red('Error inserting document: ' + err));
                    const message = 'خطا: افزودن محصول';

                    res.send({
                        'status': 500,
                        'message': message,
                        result: {}
                    });
                }else{
                    // get the new ID
                    let newId = newDoc.insertedIds[0];
                    const message = 'محصول جدید با موفقیت ایجاد شد';

                    res.send({
                        'status': 200,
                        'message': message,
                        result: {id: newId}
                    });
                }
            });
        }
    });
});

module.exports = router;
