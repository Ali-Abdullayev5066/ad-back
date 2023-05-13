module.exports.GETCASHBACK = `
	select
		customer_id,
		total,
		to_char(cash_back_create_at, 'dd-mm-YYYY hh24:mi:ss') as cash_back_create_at
	from cash_back_cards
	where id = $1	
`