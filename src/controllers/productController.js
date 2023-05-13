const ProductModel = require('../models/ProductModel');
const {
	productAddFunc,
	getAllbySort,
	putProductOne
} = require('../myFunc/productFuncs');
const { fileCompressHelper, makeid } = require('../myFunc/files');
const pathFile = 'products';
const pathFileT = 'tests';

module.exports.add = async (req, res) => {
	try {
		const result = productAddFunc(req.body);
		const files = req?.files?.image
		const format = files?.mimetype?.split('/')[1]
		const imageName = `${Date.now()}${makeid(5)}.${format}`
		result.image = `${pathFile}/n-${imageName}`

		if (req.user.status === 1) {
			const data = await ProductModel.addProduct(result);
			
			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data.constraint === 'product_name_idx') {
				res.status(449).json({
					error: true,
					message: `Ushbu nomdagi mahsulot avval ro'yxatdan o'tgan`
				});
			} else if (data.constraint === 'product_barcode_idx') {
				res.status(449).json({
					error: true,
					message: `Ushbu barcodli mahsulot avval ro'yxatdan o'tgan`
				});
			} else if (data.constraint === 'products_type_id_fkey') {
				res.status(449).json({
					error: true,
					message: `Mavjud bo'lmagan mahsulot turi belgilandi`
				});
			} else if (data?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(data)}`
				});
			} else {
				files.mv(`views/${pathFile}/${imageName}`, (err) => {
					if (err) throw err
					fileCompressHelper(`views/${pathFile}/${imageName}`, pathFile)

				})
				res.status(201).json({
					error: false,
					message: "Muvaffaqiyatli kiritildi"
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

module.exports.put = async (req, res) => {
	try {
		const productId = req.params.id;
		const { moreInfo } = req.body;

		if (req.user.status === 1) {
			const data = await ProductModel.putProductMoreInfo(moreInfo, productId);
			
			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data.constraint === 'product_name_idx') {
				res.status(449).json({
					error: true,
					message: `Ushbu nomdagi mahsulot avval ro'yxatdan o'tgan`
				});
			} else if (data.constraint === 'product_barcode_idx') {
				res.status(449).json({
					error: true,
					message: `Ushbu barcodli mahsulot avval ro'yxatdan o'tgan`
				});
			} else if (data.constraint === 'products_type_id_fkey') {
				res.status(401).json({
					error: true,
					message: `Mavjud bo'lmagan mahsulot turi belgilandi`
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

module.exports.putTwo = async (req, res) => {
	try {
		const productId = req.params.id;
		req.body.productId = productId;
		const result = putProductOne(req.body);
		
		if (req.user.isAdmin && req.user.status === 1) {			
			if (result.error) {
				res.status(401).json({
					error: true,
					message: result.message
				});
			} else {
				const data = await ProductModel.putProductOne(result);
				
				if (!data) {
					res.status(401).json({
						error: true,
						message: `Ma'lumotlar topilmadi`
					});
				} else if (data.constraint === 'product_name_idx') {
					res.status(449).json({
						error: true,
						message: `Ushbu nomdagi mahsulot avval ro'yxatdan o'tgan`
					});
				} else if (data.constraint === 'product_barcode_idx') {
					res.status(449).json({
						error: true,
						message: `Ushbu barcodli mahsulot avval ro'yxatdan o'tgan`
					});
				} else if (data.constraint === 'products_type_id_fkey') {
					res.status(401).json({
						error: true,
						message: `Mavjud bo'lmagan mahsulot turi belgilandi`
					});
				} else if (data?.severity) {
					res.status(409).json({
						error: true,
						message: `Bazaviy xatolik ${String(data)}`
					});
				} else if (!data.put_product) {
					res.status(401).json({
						error: true,
						message: `Ma'lumotlar topilmadi`
					});
				} else {
					res.status(202).json({
						error: false,
						message: 'successfully',
						data
					});
				}
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
	try {
		const productId = req.params.id;
		
		if (req.user.isAdmin && req.user.status === 1) {
			const product = await ProductModel.deleteProduct(productId);

			if (!product) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (product?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(company)}`
				});
			} else {
				res.status(202).json({
					error: false,
					product
				})
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

module.exports.all = async (req, res) => {
	try {
		const result = getAllbySort(req.query);
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await ProductModel.getAll(result);

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

module.exports.get = async (req, res) => {
	try {
		const productId = req.params.id;
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await ProductModel.getOne(productId);
			
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

module.exports.infoForProduct = async (req, res) => {
	try {
		if (req.user.isAdmin && req.user.status === 1) {
			let data = await ProductModel.infoForProduct();
			
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

module.exports.test = async (req, res) => {
	const files = req?.files?.image
	const format = files?.mimetype?.split('/')[1]
	const imageName = `${Date.now()}${makeid(5)}.${format}`
	console.log("imageName", imageName);
	console.log(req.files)

	// result.image = `${pathFileT}/n-${imageName}`

	files.mv(`views/${pathFileT}/${imageName}`, (err) => {
		if (err) throw err
		fileCompressHelper(`views/${pathFileT}/${imageName}`, pathFileT)

	})


	res.send('successfully')
}





