const router = require('express').Router();
const TypeController = require('../controllers/typeController');

const { verify } = require('../jwt/jwt');

router.get('/', verify, TypeController.getAll)
router.post('/add', verify, TypeController.add)
router.put('/edit', verify, TypeController.put)
router.delete('/delete', verify, TypeController.delete)


module.exports = router