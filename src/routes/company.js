const router = require('express').Router();
const CompanyController = require('../controllers/companyController');


const { verify } = require('../jwt/jwt');

router.get('/', verify, CompanyController.all);
router.get('/find/:id', verify, CompanyController.get);
router.post('/add', verify, CompanyController.add);
router.get('/typact', verify, CompanyController.getTyCompActiv);

module.exports = router