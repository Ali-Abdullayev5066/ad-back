const router = require('express').Router();
const SalaryController = require('../controllers/salaryController');

const { verify } = require('../jwt/jwt');

router.get('/', verify, SalaryController.getList)
router.get('/given', verify, SalaryController.getGivenSalary)
router.post('/create', verify, SalaryController.createGivenSalary)
router.delete('/delete/:id', verify, SalaryController.deleteGivenSalary)
router.put('/update-status', verify, SalaryController.updGivenSalary)
router.post('/create-avans', verify, SalaryController.creteAvans)

module.exports = router