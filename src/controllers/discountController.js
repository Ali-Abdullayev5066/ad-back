const DiscountModel = require('../models/DiscountModel');

module.exports.add = async (req, res) => {
	try {
		const { name, discountAmount } = req.body;
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await DiscountModel.addDiscount(name, discountAmount);

			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data.constraint === 'discount_idx') {
				res.status(449).json({
					error: true,
					message: `Ushbu nomdagi discount avval ro'yxatdan o'tgan`
				});
			} else if (data?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(data)}`
				});
			} 
			else {
				res.status(201).json({
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
}

module.exports.put = async (req, res) => {
	try {
		const discountId = req.params.id;
		const { name, discountAmount } = req.body;
		
		if (req.user.isAdmin && req.user.status === 1) {
			
			const data = await DiscountModel.edit(name, discountAmount, discountId);

			if (!data || data < 1) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data.constraint === 'discount_idx') {
				res.status(449).json({
					error: true,
					message: 'Ushbu chegirma nomi band'
				});
			} else if (data.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(data)}`
				});
			} else {
				res.status(202).json({
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
		const discountId = req.params.id;
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await DiscountModel.deleteDiscount(discountId);

			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data.constraint === 'selling_price_discount_id_fkey') {
				res.status(449).json({
					error: true,
					message: `Ushbu chegirma mahsulotlarda mavjud`
				});
			} else if (data?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(data)}`
				});
			} else {
				res.status(202).json({
					error: false,
					data
				});
			}
		} else {
			res.status(409).json({message: `Sizda imkoniyat yo'q`})
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
		const search = req.query.search || "";
		const offset = req?.query?.page ? ((req?.query?.page - 1) * 40) : 0
	
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await DiscountModel.getAll(search, offset);
			
			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			}else if (data?.severity) {
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




