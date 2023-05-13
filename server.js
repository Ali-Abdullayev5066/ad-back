const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const PORT = process.env.PORT || 5500;

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(express.static('views'))
app.use(fileUpload());

app.use('/api/product/find', express.static(__dirname));
app.use('/api/shop', express.static(__dirname));

//ROUTES
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const shopRoutes = require('./src/routes/shop');
const exesRoutes = require('./src/routes/exes');
const typeRoutes = require('./src/routes/types');
const discountRoutes = require('./src/routes/discount');
const productRoutes = require('./src/routes/product');
const priceRoutes = require('./src/routes/price');
const cashBoxRoutes = require('./src/routes/cashbox');
const companyRoutes = require('./src/routes/company');
const salariesRoutes = require('./src/routes/salaries');
const treasureRoutes = require('./src/routes/treasures');
const salaryRoutes = require('./src/routes/salary');
const warehouseRoutes = require('./src/routes/warehouse');
const wCustomerRoutes = require('./src/routes/wCustomer');

app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes)
app.use('/api/shop', shopRoutes);
app.use('/api/exes', exesRoutes);
app.use('/api/type', typeRoutes);
app.use('/api/discount', discountRoutes);
app.use('/api/product', productRoutes);
app.use('/api/price', priceRoutes);
app.use('/api/cashbox', cashBoxRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/salaries', salariesRoutes);
app.use('/api/treasure', treasureRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/w-customer', wCustomerRoutes);

app.listen(PORT, () => console.log(`ADMIN API ${PORT} da ishladi.`));