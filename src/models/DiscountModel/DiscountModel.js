module.exports.ADD = `
	insert into discounts (
		name,
		discount_amount
	) values ($1, $2)
	returning id, name
`

module.exports.PUTAMOUNT = `
	update discounts
		set
			name = $1,
			discount_amount = $2
	where id <> 0 and id = $3
	returning id	
`


module.exports.DELETE = `
	delete from
		discounts
	where id = $1
	returning id	
`

module.exports.ALL = `
with a
	as (
	select
	array (
		select
			jsonb_build_object (
				'number', row_number() over (order by d.id, d.discount_amount),
				'id', d.id,
				'name', d.name,
				'amount', d.discount_amount,
				'create_at', to_char(d.create_at, 'dd-mm-YYYY hh24:mi')
			)
		from discounts d
		where concat(d.name) ILIKE
		case
			when $1::text <> '%""%'::text then $1
			else d.name
		end and d.id <> 0
		order by d.id, d.discount_amount
		limit 40 offset $2
	) list,
	jsonb_build_object(
		'count', count(d.id),
		'pages', case
					when count(d.id) = 0 then 0
					when count(d.id) < 41 then 1
					when (mod(count(d.id), 40)) >= 1 then ((count(d.id) / 40) + 1)
					else (count(d.id) / 40)
				end,
		'page', case
					when count(d.id) = 0 then 0
					else $2 / 40 + 1
				end 
	) more_info
from discounts d
	where concat(d.name) ILIKE
	case
		when $1::text <> '%""%'::text then $1
		else d.name
	end
) select
	more_info,
	list
from a
`