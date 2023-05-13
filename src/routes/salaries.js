const router = require('express').Router();
const SalariesController = require('../controllers/salariesController');

const { verify } = require('../jwt/jwt');

router.get('/', verify, SalariesController.getAll)
router.post('/add', verify, SalariesController.add)
// router.put('/:id', verify, SalariesController.put)
// router.delete('/:id', verify, SalariesController.delete)


module.exports = router