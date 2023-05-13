module.exports.ADD = `
	insert into exes (
		shop_id,
	    name,
	    comment,
	    cost ) values ($1, $2, $3, $4)
	  returning *
`

module.exports.PUT = `
	update exes
		set name = $1,
			comment = $2,
			cost = $3
	where id = $4
	returning *		
`

module.exports.DELETE = `
	delete from
		exes
	where
		id = $1
	returning id, name 	
`
// $1 - 1 kunlik raznitsa bilan xarajatlarni chiqarish
module.exports.GETDAY = `
	select
		id,
		shop_id,
		name,
		comment,
		cost,
		to_char(exes_create_at, 'dd-mm-YYYY hh24:mi:ss') as current_date
	from exes
		where exes_create_at::date = (current_date - $1::int)::date
	order by exes_create_at asc
`

module.exports.GETMONTHS = `
	select 
		id,
		shop_id,
		name,
		comment,
		cost,
		to_char(exes_create_at, 'dd-mm-YYYY hh24:mi:ss') as current_date
	from exes
		where exes_create_at::date >=  CURRENT_DATE - INTERVAL '2 month'
	order by exes_create_at asc
`


