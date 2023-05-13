const router = require('express').Router();
const CashBoxController = require('../controllers/cashBoxController');

const { verify } = require('../jwt/jwt');

router.post('/add', verify, CashBoxController.add)
router.get('/', verify, CashBoxController.get)
router.delete('/delete', verify, CashBoxController.delete)

module.exports = router

