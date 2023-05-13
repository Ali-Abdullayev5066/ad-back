const ShopModel = require('../models/ShopModel');

module.exports.getAll = async (req, res) => {
	try {
		const search = req.query.search || "";
		const offset = req?.query?.page ? ((req?.query?.page - 1) * 40) : 0

		if (req.user.isAdmin && req.user.status === 1) {
			const data = await ShopModel.getAll(search, offset);
			
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
				message: `Sizda imkoniyat yo'q`
			});
		}
	} catch (e) {
		res.status(500).json({
			error: true,
			message: `Server xatolik: ${String(e)}`
		});
	}
};


module.exports.create = async (req, res) => {
	const { name, address } = req.body;
	let files = req.files.image
	const uploadPath = `views/shops/${Date.now()}.${files.mimetype.split('/')[1]}`
	try {
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await ShopModel.createShop(name, address, uploadPath);
			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data?.constraint === 'name_idx') {
				res.status(449).json({
					error: true,
					message: `Bu nomda filial mavjud`
				});
			} else if (data?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(data)}`
				});
			}  else {
				files.mv(uploadPath)
				res.status(201).json({
					error: false,
					message:  "Muvaffaqiyatli bajarildi"
				});
			}
		} else {
			res.status(403).json({
				error: true,
				message: `Sizda imkoniyat yo'q`
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
	const { shopId } = req.body;
	try {
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await ShopModel.delete(shopId);
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
			}  else {
				res.status(202).json({
					error: false,
					data
				});
			}
		} else {
			res.status(403).json({
				error: true,
				message: `Sizda imkoniyat yo'q`
			});
		}
	} catch (e) {
		res.status(500).json({
			error: true,
			message: `Server xatolik: ${String(e)}`
		});
	}
};

module.exports.update = async (req, res) => {
	const { name, address, shopId } = req.body;
	try {
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await ShopModel.update(name, address, shopId);
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
			}  else {
				res.status(202).json({
					error: false,
					data
				});
			}
		} else {
			res.status(403).json({
				error: true,
				message: `Sizda imkoniyat yo'q`
			});
		}
	} catch (e) {
		res.status(500).json({
			error: true,
			message: `Server xatolik: ${String(e)}`
		});
	}
};