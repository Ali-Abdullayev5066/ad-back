const router = require('express').Router();
const ExesController = require('../controllers/exesController');

const { verify } = require('../jwt/jwt');


router.get('/', verify, ExesController.getDay)
router.post('/add', verify, ExesController.addExec)
router.put('/edit', verify, ExesController.putExes)
router.delete('/delete', verify, ExesController.deletExes)


module.exports = router

