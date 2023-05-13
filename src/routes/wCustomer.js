const router = require('express').Router();
const WholesaleCustomersController = require('../controllers/wholesaleCustomersController');
const { verify } = require('../jwt/jwt');
const { create } = require('../middleware/wholesaleCustomersMidd');

router.post('/create', verify, create, WholesaleCustomersController.create)


module.exports = router

