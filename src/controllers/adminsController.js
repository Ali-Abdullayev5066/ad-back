const AdminModel = require('../models/AdminModel/');
const { notNullFunc } = require('../myFunc/notNullFunc');

module.exports.createAdmin = async (req, res) => {
	try {
		const result = notNullFunc(req.body)
		
		if (req.user.isAdmin && req.user.status === 1)  {
			const data = await AdminModel.create(result)

			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data.constraint === 'user_admins_idx') {
				res.status(449).json({
					error: true,
					message: 'Ushbu username band'
				});
			} else if (data?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(data)}`
				});
			} else {
				res.status(201).json({
					error: false,
					data,
					message: `Foydalanuvchi muvaffaqiyatli qo'shildi`
				});
			}
			
		} else {
			res.status(403).json({
				error: true,
				message: `Sizda imkoniyat mavjud emas`
			});
		}
	} catch (e) {
		res.status(500).json({
			error: true,
			message: `Server xatolik: ${String(e)}`
		});
	}
};

module.exports.getAll = async (req, res) => {
	try {
		const shopId = req.query.shopId || null;
		const offset = req.query?.page ? ((req.query.page - 1) * 40) : 0
		
		if (req.user.isAdmin && req.user.status === 1)  {
			const data = await AdminModel.getAll(shopId, offset);
			
			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(data)}`
				});
			} else {
				res.status(200).json({
					error: false,
					data
				});
			}
			
		} else {
			res.status(403).json({
				error: true,
				message: `Sizda imkoniyat mavjud emas`
			});
		}
	} catch (e) {
		res.status(500).json({
			error: true,
			message: `Server xatolik: ${String(e)}`
		});
	}
};

module.exports.delete = async (req, res) => {
	try {
		const adminId = req.params.id
		
		if (req.user.isAdmin && req.user.status === 1)  {
			const data = await AdminModel.delete(adminId);
		
			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(data)}`
				});
			} else {
				res.status(202).json({
					error: false,
					message: "Muvaffaqiyatli bajarildi"
				});
			}
		} else {
			res.status(403).json({
				error: true,
				message: `Sizda imkoniyat mavjud emas`
			});
		}
	} catch (e) {
		res.status(500).json({
			error: true,
			message: `Server xatolik: ${String(e)}`
		});
	}
};