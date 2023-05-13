const AdminModel = require('../models/AdminModel');
const jwt = require('../jwt/jwt');

module.exports.login = async (req, res) => {
	try {
		const {username, password } = req.body;
		const admin = await AdminModel.login(username, password);

		if (!admin) {
			res.status(401).json({
				error:true,
				message: `Ma'lumotlar topilmadi`
			});
		} else if (admin?.severity) {
			res.status(409).json({
				error:true,
				message: `Bazaviy xatolik: ${String(admin)}`
			});
		} else if (admin.verify_auth.error) {
			res.status(401).json(admin.verify_auth);
		}  else {
			let { verify_auth } = admin;
			let jwtConfig = {
				id: verify_auth.id,
				shopId: verify_auth.shop_id,
				isAdmin: verify_auth.is_admin,
				status: verify_auth.status,
				username: verify_auth.username
			};
			const accessToken = jwt.sign(jwtConfig);
			res.status(201).json({
				error: false,
				admin: admin.verify_auth,
				accessToken
			});
		}
	} catch (e) {
		res.status(500).json({
			error: true,
			message: `Server xatolik: ${String(e)}`
		});
	}
}