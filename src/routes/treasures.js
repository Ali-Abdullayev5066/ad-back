const router = require('express').Router();
const TreasuresController = require('../controllers/treasuresController');

const { verify } = require('../jwt/jwt');

router.get('/', verify, TreasuresController.getStatic);
router.put('/change-status', verify, TreasuresController.changeStatus);
router.get('/find', verify, TreasuresController.getCashReg);
router.get('/find-cashbox', verify, TreasuresController.getCashBoxList);


module.exports = router;
