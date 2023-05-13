module.exports.ADD = `
	insert into cashbox (
		shop_id,
		cash_number
	) values ($1, $2)
	returning id
`

module.exports.GETONSHOPS = `
with a
	as (
	select
	array (
		select
			jsonb_build_object (
				'number', row_number() over (order by c.cash_number),
				'id', c.id,
				'branch', sh.name,
				'cash_number', concat(c.cash_number, '-G''azna'),
				'create_at', to_char(c.create_at, 'dd-mm-YYYY hh24:mi')		
			)
		from cashbox c
		inner join shops sh on c.shop_id = sh.id
		where c.shop_id =
		case
			when $1::int is not null then $1::int
			else sh.id
		end
		order by c.cash_number
		limit 40 offset $2
	) list,
	array (
		select
			jsonb_build_object (
				'id', sh.id,
				'shop_name', sh.name
			)
			from shops sh
			order by sh.id
	) shop_list,
	jsonb_build_object(
		'count', count(c.id),
		'pages', case
					when count(c.id) = 0 then 0
					when count(c.id) < 41 then 1
					when (mod(count(c.id), 40)) >= 1 then ((count(c.id) / 40) + 1)
					else (count(c.id) / 40)
				end,
		'page', case
					when count(c.id) = 0 then 0
					else $2 / 40 + 1
				end 
	) more_info
from cashbox c
	inner join shops sh on c.shop_id = sh.id
	where c.shop_id =
	case
		when $1::int is not null then $1::int
		else sh.id
	end
) select
	more_info,
	shop_list,
	list
from a;	
`

module.exports.DELETE = `
	delete from
		cashbox
	where id = $1
	returning id	
`