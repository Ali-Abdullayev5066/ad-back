module.exports.notNullFunc = (params) => {
	let st = Object.values(params).some(x => (x === null || x === "" || x === 0))
	let options = st ? null : params
	return options
};


module.exports.priceFunc = (params) => {
	let st = Object.values(params).some(x => (x === null || x === "" || x === 0));
	let err;
	let columns =
		[
			'discount_id',
			'price'
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