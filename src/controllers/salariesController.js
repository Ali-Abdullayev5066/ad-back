const SalariesModel = require('../models/SalariesModel');

module.exports.add = async (req, res) => {
	try {
		const { category, rankId, amount } = req.body
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await SalariesModel.add(category, rankId, amount)
		
			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data.constraint === 'rank_categ_idx') {
				res.status(449).json({
					error: true,
					message: 'Ushbu lavozimdagi kategoriyada summa mavjud'
				});
			} else if (data?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(data)}`
				});
			} else {
				res.status(201).json({
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
}

module.exports.put = async (req, res) => {
	try {
		const rankId = req.params.id
		const { name } = req.body
	
		if (req.user.isAdmin && req.user.status === 1) {	
			const data = await RankModel.edit(name, rankId)

			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				})
			} else if (data.constraint === 'product_idx') {
				res.status(449).json({
					error: true,
					message: `Ushbu oylik turi avval ro'yxatdan o'tgan`
				})
			} else if (newProduct?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(newProduct)}`
				});
			} else {
				res.status(201).json({
					error:false,
					data
				})
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
}


module.exports.getAll = async (req, res) => {
	try {
		const { rankId } = req.body
		const offset = req?.query?.page ? ((req?.query?.page - 1) * 40) : 0
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await SalariesModel.getAll(rankId, offset);
		
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