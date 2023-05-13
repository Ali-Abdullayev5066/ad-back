module.exports.ADD = `
	insert into
		companies (
			type_activity_id,
			name,
			info,
            bank_code,
            invoice_number
		) values ($1, $2, $3, $4, $5)
	returning id	
`

module.exports.PUT = `
	update companies
		set
			name = $1,
			info = $2
			company_update_at = now()
	returning id		
`

module.exports.DELETE = `
	delete from
		companies
	where id = $1
	returning id	
`

module.exports.GETALL = `
with a
	as (
	select
	array (
		select
			jsonb_build_object (
				'number', row_number() OVER (order by c.id),
				'id', c.id,
				'tca_name', tca.name,
				'company_name', c.name,
				'bank_code', c.bank_code,
				'invoice_number', c.invoice_number,
				'create_at', to_char(c.create_at, 'dd-mm-YYYY hh24:mi'),
				'region', c.info->>'region',
				'products', count(p.id),
				'phone', nullif(trim(to_char((c.info->>'phone')::bigint,'999(99) 999-99-99')), '')
			)
		from companies c
		left join types_company_activities tca on c.type_activity_id = tca.id
		left join products p on p.company_id = p.id
		where tca.id =
		case
			when $1::int is not null then $1::int
			else tca.id
		end and c.info->>'region'::text =
		case
			when $4::text <> '' then $4::text
			else c.info->>'region'::text
		end and concat(c.name) ILIKE
		case
			when $3::text <> '%""%'::text then $3
			else c.name
		end
		group by c.id, tca.name
		order by c.id
		limit 40 offset $2
	) list,
	array (
		select
			jsonb_build_object (
				'id', tca.id,
				'name', tca.name
			)
			from types_company_activities tca
	) tca_list,
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
from companies c
	left join types_company_activities tca on c.type_activity_id = tca.id
	where tca.id =
	case
		when $1::int is not null then $1::int
		else tca.id
	end and c.info->>'region'::text =
	case
		when $4::text <> '' then $4::text
		else c.info->>'region'::text
	end and concat(c.name) ILIKE
	case
		when $3::text <> '%""%'::text then $3
		else c.name
	end
) select
	more_info,
	tca_list,
	list
from a
`

module.exports.TYCOMPACTIVIT = `
	UPDATE companies SET info = jsonb_set(info, '{region}', '""');
`

module.exports.GET = `
with days as (
select
	((now()::date - interval '7 days')::date + i * interval '1 day')::date as day,
	extract('dow' from (now()::date - interval '7 days')::date + i * interval '1 day') as dow,
	case
		when extract('dow' from (now()::date - interval '7 days')::date + i * interval '1 day') in (0, 6)
		then false
		else true
	end is_weekday
from generate_series(0, now()::date - (now()::date - interval '7 days')::date) i
), months as (
select
	date_trunc('month', (now()::date - interval '1 year') + (interval '1' month * generate_series(0,month_count::int)))::date as month
from (
   select extract(month from diff) + 12 as month_count
   from (
     select date_trunc('month', age(current_timestamp, (now()::date - interval '1 year'))) as diff
   ) td
) t
), to_warehouse_monthly as (
	select
		row_number() over(order by sum((contract->>'price')::numeric * (contract->>'amount')::numeric) desc ) id,
		sh.name,
		round(sum((contract->>'amount')::numeric), 2) product_amount,
		round(sum((contract->>'price')::numeric * (contract->>'amount')::numeric), 2) as total
	from add_to_warehouse w
	left join lateral jsonb_array_elements(w.item) as contract on true
	left join shops sh on sh.id = w.shop_id
	left join products p on p.id = (contract->>'productId')::int
	where
	date_trunc('month', w.create_at)::date = date_trunc('month', now()::date)::date and
	w.vendor_organization = $1
	group by sh.id
	order by total desc
), to_warehouse_weekly as (
	select
		row_number() over(order by sum((contract->>'price')::numeric * (contract->>'amount')::numeric) desc ) id,
		sh.name,
		round(sum((contract->>'amount')::numeric), 2) product_amount,
		round(sum((contract->>'price')::numeric * (contract->>'amount')::numeric), 2) as total
	from add_to_warehouse w
	left join lateral jsonb_array_elements(w.item) as contract on true
	left join shops sh on sh.id = w.shop_id
	left join products p on p.id = (contract->>'productId')::int
	where
		w.create_at::date >= now()::date - interval '7 days' and
		w.create_at::date <= now()::date and
	w.vendor_organization = $1
	group by sh.id
	order by total desc
), to_warehouse_today as (
	select
		row_number() over(order by sum((contract->>'price')::numeric * (contract->>'amount')::numeric) desc ) id,
		sh.name,
		round(sum((contract->>'amount')::numeric), 2) product_amount,
		round(sum((contract->>'price')::numeric * (contract->>'amount')::numeric), 2) as total
	from add_to_warehouse w
	left join lateral jsonb_array_elements(w.item) as contract on true
	left join shops sh on sh.id = w.shop_id
	left join products p on p.id = (contract->>'productId')::int
	where w.create_at::date = now()::date and
	w.vendor_organization = $1
	group by sh.id
	order by total desc
), purchase_monthly as (
	select
		row_number() over(order by sum((contract->>'amount')::numeric) desc) id,
		sh.name,
		round(sum((contract->>'amount')::numeric), 2) product_amount		
	from purchase_returns w
	left join lateral jsonb_array_elements(w.item) as contract on true
	left join shops sh on sh.id = w.shop_id
	left join products p on p.id = (contract->>'productId')::int
	where
	date_trunc('month', w.create_at)::date = date_trunc('month', now()::date)::date and
	w.host_organization = $1
	group by sh.id
	order by product_amount desc
), purchase_weekly as (
	select
		row_number() over(order by sum((contract->>'amount')::numeric) desc) id,
		sh.name,
		round(sum((contract->>'amount')::numeric), 2) product_amount		
	from purchase_returns w
	left join lateral jsonb_array_elements(w.item) as contract on true
	left join shops sh on sh.id = w.shop_id
	left join products p on p.id = (contract->>'productId')::int
	where
		w.create_at::date >= now()::date - interval '7 days' and
		w.create_at::date <= now()::date and
	w.host_organization = $1
	group by sh.id
	order by product_amount desc
), purchase_today as (
	select
		row_number() over(order by sum((contract->>'amount')::numeric) desc) id,
		sh.name,
		round(sum((contract->>'amount')::numeric), 2) product_amount		
	from purchase_returns w
	left join lateral jsonb_array_elements(w.item) as contract on true
	left join shops sh on sh.id = w.shop_id
	left join products p on p.id = (contract->>'productId')::int
	where w.create_at::date = now()::date and
	w.host_organization = $1
	group by sh.id
	order by product_amount desc
), top_product_year as (
	select
		p.name,
		round(sum((contract->>'amount')::numeric), 2) summ
	from sales_check s
	left join lateral jsonb_array_elements(s.list) as contract on true
	inner join products p on p.id = (contract->>'productId')::int
	where date_trunc('year', s.create_at) = date_trunc('year', now()::date) and p.company_id = $1
	group by p.name
	limit 10
), top_product_monthly as (
	select
		p.name,
		round(sum((contract->>'amount')::numeric), 2) summ
	from sales_check s
	left join lateral jsonb_array_elements(s.list) as contract on true
	inner join products p on p.id = (contract->>'productId')::int
	where date_trunc('month', s.create_at) = date_trunc('month', now()::date) and p.company_id = $1
	group by p.name
	limit 10
), top_product_weekly as (
	select
		p.name,
		round(sum((contract->>'amount')::numeric), 2) summ
	from sales_check s
	left join lateral jsonb_array_elements(s.list) as contract on true
	inner join products p on p.id = (contract->>'productId')::int
	where
	(s.create_at::date >= now()::date - interval '7 days' and
	s.create_at::date <= now()::date) and
	p.company_id = $1
	group by p.name
	limit 10
), top_product_today as (
	select
		p.name,
		round(sum((contract->>'amount')::numeric), 2) summ
	from sales_check s
	left join lateral jsonb_array_elements(s.list) as contract on true
	inner join products p on p.id = (contract->>'productId')::int
	where s.create_at::date = now()::date and
	p.company_id = $1
	group by p.name
	limit 10
), product_list as (
	select
		p.id id,
		p.name name,
		p.barcode barcode,
		round(coalesce((s.price - (s.price * d.discount_amount / 100)), 0), 2) price,
		p.image image
	from products p
	left join selling_price s on s.product_id IS NOT DISTINCT FROM p.id
	left join discounts d on s.discount_id = d.id
	where p.company_id = $1	
	order by p.id
)
select
	c.id id,
	c.name company_name,
	c.bank_code,
	tca.id type,
	to_jsonb(array(
		select to_jsonb(t) from types_company_activities t 
	)) type_list,
	c.invoice_number,
	to_char(c.create_at, 'dd-mm-YYYY hh24:mi') create_at,
	c.info->>'region' region,
	c.info->>'address' address,
	nullif(trim(to_char((c.info->>'telephone')::bigint,'999(99) 999-99-99')), '') contact,
	to_jsonb(array(
		select jsonb_build_object (
			'day', to_char(d.day, 'dd.mm.yy'),
			'summ', (
				select
					round(coalesce(sum((contract->>'price')::numeric * (contract->>'amount')::numeric), 0), 2)
				from sales_check s
				left join lateral jsonb_array_elements(s.list) as contract on true
				inner join products p on p.id = (contract->>'productId')::int
				where s.create_at::date = d.day and p.company_id = $1
			)
		)
		from days d
		group by d.day
		order by d.day
	)) sale_of_week,
	to_jsonb(array(
		select jsonb_build_object (
			'month', trim(nullif(to_char(m.month, 'yyyy-mm'), '')),
			'summ', (
				select
					round(coalesce(sum((contract->>'price')::numeric * (contract->>'amount')::numeric), 0), 2)
				from sales_check s
				left join lateral jsonb_array_elements(s.list) as contract on true
				inner join products p on p.id = (contract->>'productId')::int
				where date_trunc('month', s.create_at)::date = m.month and p.company_id = $1
			)
		)
		from months m
		group by m.month
		order by m.month
	)) sale_of_year,
	(
		select jsonb_build_object (
			'of_today', array (
				select to_jsonb(t) from top_product_today t
			),
			'of_week', array (
				select to_jsonb(t) from top_product_weekly t
			),
			'of_month', array (
				select to_jsonb(t) from top_product_monthly t
			),
			'of_year', array (
				select to_jsonb(t) from top_product_year t
			)
		)
	) top_sale_products,
	(
		select jsonb_build_object (
			'of_today', array (
				select to_jsonb(t) from to_warehouse_today t 
			),
			'of_week', array (
				select to_jsonb(t) from to_warehouse_weekly t
			),
			'of_month', array (
				select to_jsonb(t) from to_warehouse_monthly t
			)
		)
	) warehouse_list,
	(
		select jsonb_build_object (
			'of_today', array (
				select to_jsonb(t) from purchase_today t 
			),
			'of_week', array (
				select to_jsonb(t) from purchase_weekly t
			),
			'of_month', array (
				select to_jsonb(t) from purchase_monthly t
			)
		)
	) purchase_list,
	(
		select array (
			select to_jsonb(t) from product_list t 
		)
	) product_list
from companies c
left join types_company_activities tca on c.type_activity_id = tca.id
where c.id = $1		
`