module.exports.productAddFunc = (params) => {
	params.barcode = String(Number(params.barcode)) !== 'NaN' ? params.barcode : null
	params.moreInfo = JSON.parse(params.moreInfo).moreInfo
	let st = Object.values(params).some(x => (x === null || x === "" || x === 0))
	let options = st ? null : params
	return options
};

module.exports.getAllbySort = (params) => {
	params.companyId = params?.companyId || null
	params.typeId = params.typeId || null
	params.onSale = params?.onSale || null
	params.offset = params?.page ? ((params.page - 1) * 40) : 0
	params.search = params?.search ? params.search : ""
	params.discountId = params?.discountId || null
	return params
};

module.exports.putProductOne = (params) => {
	let st = Object.values(params).some(x => (x === null || x === ""));
	let err;
	let columns =
		[
			'type_id',
			'company_id',
			'name',
			'image',
			'barcode',
			'on_sale',
			'to_cash_back',
			'is_vat',
			'unit_id',
			'discount_id',
			'sale_price',
		];
	
	for (let i of columns) {
		if (i !== params.column) {
			err = true
		} else {
			err = false
			break;
		}
	}
	if (st) {
		return {error: true, message: "Qatorlar bo'sh qoldirilgan"}
	} else if (err) {
		return {error: true, message: "Mavjud bo'lmagan column belgilandi"}
	} else {
		return params
	}
};
