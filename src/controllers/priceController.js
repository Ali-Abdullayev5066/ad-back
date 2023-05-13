const SellingPriceModel = require('../models/SellingPriceModel');
const { notNullFunc, priceFunc } = require('../myFunc/notNullFunc');

module.exports.add = async (req, res) => {
	const productId = req.params.id
	const result = priceFunc(req.body);
	try {
		if (req.user.isAdmin && req.user.status === 1) {
			const newPrice = await SellingPriceModel.addPrice(result, productId);
			if (!newPrice) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (newPrice.constraint === 'price_product_idx') {
				res.status(449).json({
					error: true,
					message: 'Bu mahsulotda narx mavjud'
				});
			} else if (newPrice.constraint === 'selling_price_discount_id_fkey') {
				res.status(449).json({
					error: true,
					message: 'Bu turdagi chegirma mavjud emas'
				});
			} else if (newPrice?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(newPrice)}`
				});
			} else {
				res.status(201).json({
					error: false,
					newPrice
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
