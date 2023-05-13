require('dotenv').config()

module.exports.CREATESHOP = `
	with new_shop as (
		insert into shops (
			name,
			address,
			image
		) values ($1, $2, $3)
		returning id as shop_id
	) insert into staus_main_treasury (
		shop_id,
		until_day
	) values ( (select shop_id from new_shop), current_date ) returning id
`

module.exports.ALLSHOP = `
with a as (
	select
	array (
		select
			jsonb_build_object (
				'number', row_number() over (order by sh.id),
				'id', sh.id,
				'name', sh.name,
				'address', sh.address,
				'summ', 'image', concat('${process.env.IMAGE_KEY}', sh.image),
							round((
					(	coalesce(sum(value::numeric), 0) +
						coalesce(sum(cshrg.uzcard), 0) +
						coalesce(sum(cshrg.humo), 0) +
						coalesce(sum(cshrg.fine_cash), 0)
					) +
					coalesce(sum(cshrg.diff), 0)
				), 2),
				'check_amount', coalesce(sum(cshrg.check_amount), 0),
				'create_at', to_char(sh.create_at, 'dd.mm.YYYY / hh24:mi')
			)
		from shops sh
		right join cashbox cb on cb.shop_id = sh.id
		right join cash_register cshrg on cshrg.cashbox_id = cb.id
		inner JOIN LATERAL jsonb_array_elements(cshrg.cash) ON TRUE
		where concat(sh.name, sh.address) ILIKE
		case
			when '%""%'::text <> '%""%'::text then '%""%'
			else sh.name
		end
		group by sh.id
		order by sh.id
		limit 40 offset 0
	) list,
	jsonb_build_object(
		'count', count(sh.id),
		'pages', case
					when count(sh.id) = 0 then 0
					when count(sh.id) < 41 then 1
					when (mod(count(sh.id), 40)) >= 1 then ((count(sh.id) / 40) + 1)
					else (count(sh.id) / 40)
				end,
		'page', case
					when count(sh.id) = 0 then 0
					else 0 / 40 + 1
				end 
	) more_info
from shops sh
	where concat(sh.name, sh.address) ILIKE
	case
		when '%""%'::text <> '%""%'::text then '%""%'
		else sh.name
	end
) select
	more_info,
	list
from a
`

module.exports.DELETE = `
	delete
		from
	shops
		where id = $1
	returning id, name
`

module.exports.PUT = `
	update shops
		set
			name = $1,
			address = $2
	where id = $3
	returning id, name, address		
`

module.exports.TEST = `

select
	round((
		(	coalesce(sum(value::numeric), 0) +
			coalesce(sum(cshrg.uzcard), 0) +
			coalesce(sum(cshrg.humo), 0) +
			coalesce(sum(cshrg.fine_cash), 0)
		) +
		coalesce(sum(cshrg.diff), 0)
	), 2) summ,
	coalesce(sum(cshrg.check_amount), 0) check_amount,
	sh.name
from cash_register cshrg
left JOIN LATERAL jsonb_array_elements(cshrg.cash) ON TRUE
left join cashbox cb on cb.id = cshrg.cashbox_id
right join shops sh on sh.id = cb.shop_id
where cshrg.register_date = current_date - 1
group by cb.shop_id, cshrg.register_date, sh.id

select 




	round((coalesce(sum(value::numeric), 0)), 2) +
	round((coalesce((sum(cshrg.uzcard)), 0) + coalesce((sum(cshrg.humo)), 0)), 2) -
	coalesce(sum(cshrg.fine_cash), 0),
	coalesce(sum(cshrg.diff), 0),
	coalesce(sum(cshrg.check_amount)) check_amount,
	cb.shop_id,
	cshrg.register_date
from cash_register cshrg
	left JOIN LATERAL jsonb_array_elements(cshrg.cash) ON TRUE
	left join cashbox cb on cb.id = cshrg.cashbox_id
group by cb.shop_id, cshrg.register_date


+
	round((coalesce((sum(cshrg.uzcard)), 0) + coalesce((sum(cshrg.humo)), 0)), 2) -
	sum(cshrg.fine_cash) ) +
	sum(cshrg.diff)




	jsonb_build_object (
		'id', cshrg.id,
		'cash', round((coalesce(sum(value::numeric), 0)), 2),
		'card', round((coalesce((cshrg.uzcard), 0) + coalesce((cshrg.humo), 0)), 2),
		'diff', cshrg.diff,
		'fine_cash', cshrg.fine_cash,
		'total',
			round((
				(	coalesce(sum(value::numeric), 0) +
					coalesce((cshrg.uzcard), 0) +
					coalesce((cshrg.humo), 0) +
					coalesce(cshrg.fine_cash, 0)
				) +
				coalesce(cshrg.diff, 0)), 2
			),
		'personal_name', p.last_name || ' ' || p.first_name
	)
	from cash_register cshrg
	left JOIN LATERAL jsonb_array_elements(cshrg.cash) ON TRUE
	left join cashbox cb on cb.id = cshrg.cashbox_id
	left join cashiers csh on cshrg.cashier_id = csh.id
	left join personals p on p.id = csh.personal_id
	where
		cb.shop_id = $1 and
		cshrg.cashier_id = a.cashier_id::int and
		cshrg.id = $3 and
		cshrg.register_date =
	case
		when $2::date is not null then $2::date
		else current_date
	end
	group by cshrg.id, p.id

`