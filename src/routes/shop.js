const router = require('express').Router();
const ShopController = require('../controllers/shopController');

const { verify } = require('../jwt/jwt');
const { create } = require('../middleware/shopMidd');

router.get('/', verify, ShopController.getAll);
router.post('/add', verify, create, ShopController.create);
router.delete('/delete', verify, ShopController.delete);
router.put('/edit', verify, ShopController.update);

module.exports = router;
