const router = require('express').Router();
const AdminsController = require('../controllers/adminsController');

const { verify } = require('../jwt/jwt');

router.get('/', verify, AdminsController.getAll);
router.post('/add', verify, AdminsController.createAdmin);
router.delete('/delete/:id', verify, AdminsController.delete);

module.exports = router