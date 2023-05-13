const router = require('express').Router();
const PriceController = require('../controllers/priceController');

const { verify } = require('../jwt/jwt');

router.post('/add/:id', verify, PriceController.add)

module.exports = router

