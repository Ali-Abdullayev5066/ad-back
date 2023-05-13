const router = require('express').Router();
const AuthController = require('../controllers/authController');
const AdminsController = require('../controllers/adminsController');
const { verify } = require('../jwt/jwt');

router.post('/login', AuthController.login);
router.post('/register', verify, AdminsController.createAdmin);

module.exports = router