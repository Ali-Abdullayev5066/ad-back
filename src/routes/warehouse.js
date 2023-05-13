const router = require('express').Router();
const WarehouseController = require('../controllers/warehouseController');

const { verify } = require('../jwt/jwt');

router.get('/', verify, WarehouseController.getAll)
router.get('/pdf', verify, WarehouseController.getOnePdf)
router.post('/add', verify, WarehouseController.addPayment)
router.delete('/delete/:id', verify, WarehouseController.deletePayment)
router.get('/purchase-list', verify, WarehouseController.getAllPurchase)
router.get('/purchase-pdf', verify, WarehouseController.getPurchasePdf)
router.get('/balance', verify, WarehouseController.balance)

module.exports = router