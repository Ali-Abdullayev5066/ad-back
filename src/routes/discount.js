const router = require('express').Router();
const DiscountController = require('../controllers/discountController');

const { verify } = require('../jwt/jwt');

router.get('/', verify, DiscountController.getAll)
router.post('/add', verify, DiscountController.add)
router.put('/:id', verify, DiscountController.put)
router.delete('/:id', verify, DiscountController.delete)


module.exports = router