module.exports.ADD = `
	with a as (
		insert into products (
			type_id,
			company_id,
			unit_id,
			name,
			barcode,
			on_sale,
			is_vat,
			to_cash_back,
			image,
			more_info
		) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		returning id, name
	) insert into selling_price (
		product_id, discount_id, price
	) select a.id, $11, $12
	from a
	returning id
`

module.exports.PUTINFO = `
	update products
		set
			more_info = $1
	where id = $2		
	returning id	
`

module.exports.PUTONE = `
	select put_product($1, $2, $3); 
`

module.exports.DELETE = `
	delete from
		products
	where id = $1
	returning id, name	
`

module.exports.GETALL = `
with a
	as (
	select
	array (
		select
			jsonb_build_object (
				'number', row_number() OVER (order by p.create_at, p.on_sale),
				'id', p.id,
				'barcode', p.barcode,
				'name', p.name,
				'company', c.name,
				'tca.name', tca.name,
				'type_name', t.name,
				'on_sale', p.on_sale,
				'price', case
							when
								s.price is null
							then null
							else TRIM(to_char (s.price,'999,999,999'))
						end,
				'create_at', to_char(p.create_at, 'dd.mm.YYYY')
			)
		from products p
		left join types t on p.type_id = t.id
		left join selling_price s on s.product_id IS NOT DISTINCT FROM p.id
		left join discounts d on s.discount_id = d.id
		left join companies c on c.id = p.company_id
		left join types_company_activities tca on c.type_activity_id = tca.id
		where p.company_id =
		case
			when $1::int is not null then $1::int
			else c.id
		end and s.discount_id =
		case
			when $5::int is not null then $5::int
			else s.discount_id
		end and p.type_id =
		case
			when $2::int is not null then $2::int
			else t.id
		end and concat(p.barcode,' ', p.name) ILIKE
		case
			when $3::text <> '%""%'::text then $3
			else p.barcode
		end
		order by p.create_at, p.on_sale
		limit 40 offset $4
	) list,
	array (
		select
			DISTINCT
			jsonb_build_object (
				'id', t.id,
				'name', t.name
			)
			from types t
	) type_list,
	array (
		select
			DISTINCT
				jsonb_build_object (
					'id', c.id,
					'name', c.name
				)
			from companies c
			limit 3000
	) company_list,
	array (
		select
			jsonb_build_object (
				'id', d.id,
				'name', d.discount_amount || ' ' || d.name
			)
		from discounts d
		order by d.discount_amount, d.id
		limit 3000
	) discount_list,
	jsonb_build_object(
		'count', count(p.id),
		'pages', case
					when count(p.id) = 0 then 0
					when count(p.id) < 41 then 1
					when (mod(count(p.id), 40)) >= 1 then ((count(p.id) / 40) + 1)
					else (count(p.id) / 40)
				end,
		'page', case
					when count(p.id) = 0 then 0
					else $4 / 40 + 1
				end 
	) more_info
from products p
left join types t on p.type_id = t.id
left join selling_price s on s.product_id IS NOT DISTINCT FROM p.id
left join discounts d on s.discount_id = d.id
left join companies c on c.id = p.company_id
where p.company_id =
		case
			when $1::int is not null then $1::int
			else c.id
		end and s.discount_id =
		case
			when $5::int is not null then $5::int
			else s.discount_id
		end and p.type_id =
		case
			when $2::int is not null then $2::int
			else t.id
		end and concat(p.barcode,' ', p.name) ILIKE
		case
			when $3::text <> '%""%'::text then $3
			else p.barcode
		end
) select
	more_info,
	type_list,
	company_list,
	discount_list,
	list
from a;	
`

module.exports.GETONE = `
with a as (
	select
		row_number() over(order by to_char(w.create_at, 'dd.mm.yyyy')) number,
		to_char(w.create_at, 'dd.mm.yyyy') create_at,
		sum((war->>'amount')::numeric) amount,
		(war->>'price')::numeric price,
		(war->>'price')::numeric * sum((war->>'amount')::numeric) total
	from add_to_warehouse w
	left join jsonb_array_elements(w.item) war on true
	left join products p on p.id = (war->>'productId')::int
	left join units u on p.unit_id = u.id
	where (war->>'productId')::int = $1 and w.create_at::date >= date_trunc('month', current_date)
	group by to_char(w.create_at, 'dd.mm.yyyy'), (war->>'price')
	order by to_char(w.create_at, 'dd.mm.yyyy')
), b as (
	select
		row_number() over(order by (sal->>'price')::numeric) number,
		sum((sal->>'amount')::numeric) amount,
		round(((sal->>'price'))::numeric, 2) price,
		round(((sal->>'price'))::numeric, 2) * sum((sal->>'amount')::numeric) total
	from sales_check
	left join lateral jsonb_array_elements(sales_check.list) sal on true
	where (sal->>'productId')::int = $1 and sales_check.create_at::date >= date_trunc('month', current_date)
	group by (sal->>'price')
	order by (sal->>'price')::numeric
),	months as (
	select
		to_char((current_date - INTERVAL '12 months')  + (interval '1' month * generate_series(0,month_count::int)), 'YYYY-MM') mon
		from (
			select extract(year from diff) * 6 + extract(month from diff) + 6 as month_count
		from (
			select age(current_timestamp, (current_date - INTERVAL '12 months')) as diff
		) td
	) t
), cd_year as (
	select
		row_number() over(order by m.mon) number,
		m.mon create_at,
		sum((war->>'amount')::numeric)  FILTER (WHERE (war->>'productId')::int = $1)amount,
		sum((war->>'price')::numeric * (war->>'amount')::numeric) FILTER (WHERE (war->>'productId')::int = $1) total
	from months m
	left join add_to_warehouse w on m.mon = to_char(w.create_at, 'YYYY-MM')
	left  OUTER  join jsonb_array_elements(w.item) war on true
	group by m.mon, to_char(w.create_at, 'YYYY-MM')
	order by create_at
) select
	to_char(current_date, 'mm-yyyy') this_month,
	array (
		select
			jsonb_build_object (
				'id', d.id,
				'name', d.discount_amount || '% ' || d.name
			)
		from discounts d
		order by d.discount_amount
		limit 3000
	) discount_list,
	array (
		select
			jsonb_build_object (
				'id', c.id,
				'name', c.name
			)
		from companies c
		where length(c.name) > 5
		order by c.name asc
		limit 3000	
	) company_list,
	array (
		select
			jsonb_build_object (
				'id', u.id,
				'name', u.name
			)
		from units u	
	) unit_list,
	(
		select
			jsonb_build_object (
				'total_count', round((sum(a.amount)), 2),
				'total_price', round((sum(a.total)), 2),
				'list', to_jsonb (
						array (
							select
								jsonb_build_object (
									'number', a.number,
									'create_at', a.create_at,
									'amount', round((a.amount), 2),
									'price', round((a.price), 2),
									'total', round((a.total), 2)
								)
							from a						
						)
					)
			)
		from a	
	) to_warehouse,
	array (
		select
			jsonb_build_object (
				'number', cd_year.number,
				'month', cd_year.create_at,
				'amount', cd_year.amount,
				'total', cd_year.total
			)
		from cd_year	
	) to_warehouse_of_year,
	(
		select
			jsonb_build_object (
				'total_count', round((sum(b.amount)), 2),
				'total_price', round((sum(b.total)), 2),
				'list', to_jsonb (
						array (
							select
								jsonb_build_object (
									'number', b.number,
									'amount', round((b.amount), 2),
									'price', round((b.price), 2),
									'total', round((b.total), 2)
								)
							from b						
						)
					)
			)
		from b	
	) sale_list,
	p.id product_id,
	p.unit_id unit_id,
	d.discount_amount || '%' discount_name,
	tca.name || ' ' || c.name company,
	p.company_id company_id,
	p.name product_name,
	s.price for_input,
	coalesce((s.price - (s.price * d.discount_amount / 100)), 0) disc_price,
	s.discount_id discount_id,
	p.is_vat is_vat,
	p.image,
	p.barcode,
	p.more_info,
	p.on_sale on_sale,
	p.to_cash_back to_cash_back,
	to_char(p.create_at, 'hh24:mi / dd.mm.YYYY') as create_at,
	to_char(p.product_update_at, 'hh24:mi / dd.mm.YYYY') as update_at
from products p
left join types t on p.type_id = t.id
left join selling_price s on s.product_id IS NOT DISTINCT FROM p.id
left join discounts d on s.discount_id = d.id
left join companies c on c.id = p.company_id
left join types_company_activities tca on c.type_activity_id = tca.id
where p.id = $1
`

module.exports.CREATEINFO = `
	select
		array (
			select
				jsonb_build_object (
					'id', t.id,
					'name', t.name
				)
			from types t
			where length(t.name) > 5
			order by t.name asc
			limit 5000
		) type_info,
		array (
			select
				jsonb_build_object (
					'id', c.id,
					'name', c.name
				)
			from companies c
			order by c.name asc
			limit 5000	
		) company_info,
		array (
			select
				jsonb_build_object (
					'id', u.id,
					'name', u.name
				)
			from units u	
		) unit_info,
		array (
			select
				jsonb_build_object (
					'id', d.id,
					'name', concat(d.name, ' ', d.discount_amount, '%'),
					'amount', d.discount_amount
				)
			from discounts d
			order by d.id asc
			limit 500	
		) discount_info
`


		
module.exports.TEST = `
WITH months as (
	select
		to_char((current_date - INTERVAL '12 months')  + (interval '1' month * generate_series(0,month_count::int)), 'YYYY-MM') mon
		from (
			select extract(year from diff) * 6 + extract(month from diff) + 6 as month_count
		from (
			select age(current_timestamp, (current_date - INTERVAL '12 months')) as diff
		) td
	) t
), c as (
	select
		row_number() over(order by m.mon) number,
		m.mon create_date,
		sum((war->>'amount')::numeric)  FILTER (WHERE (war->>'productId')::int = 39)amount,
		sum((war->>'price')::numeric * (war->>'amount')::numeric) FILTER (WHERE (war->>'productId')::int = 39) total
	from months m
	left join add_to_warehouse w on m.mon = to_char(w.create_at, 'YYYY-MM')
	left  OUTER  join jsonb_array_elements(w.item) war on true
	group by m.mon, to_char(w.create_at, 'YYYY-MM')
	order by  create_date
)
select * from c	
`