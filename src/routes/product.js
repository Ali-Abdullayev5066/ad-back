const router = require('express').Router();
const ProductController = require('../controllers/productController');

const { verify } = require('../jwt/jwt');
const { create } = require('../middleware/shopMidd');

router.get('/', verify, ProductController.all)
router.get('/find/:id', verify, ProductController.get)
router.get('/info', verify, ProductController.infoForProduct)
router.post('/add', verify, ProductController.add)
router.put('/put/:id', verify, ProductController.put)
router.put('/edit/:id', verify, ProductController.putTwo)
router.delete('/delete/:id', verify, ProductController.delete)

router.post('/test', ProductController.test)

module.exports = router
