module.exports.GETADDWAREHOUSE = `
with a as (
	select
		pp.add_to_warehouse_id add_war_id,
		to_jsonb(
		array (
			select jsonb_build_object (
				'number', row_number() over (order by p.id desc),
				'id', p.id,
				'cash', round(p.cash, 2),
				'transfer', round(p.transfer, 2),
				'delete_b',
				case
					when date_trunc('month', p.create_at) = date_trunc('month', now()) then true
					else false
				end,	
				'create_at', to_char(p.create_at, 'dd.mm.yyyy / hh24:mi')
			) list
			from payment_products p
			left join add_to_warehouse w on w.id = p.add_to_warehouse_id
			where p.add_to_warehouse_id = pp.add_to_warehouse_id and w.shop_id = 
			case
				when $1::int is not null then $1::int
				else w.shop_id
			end and w.vendor_organization =
			case
				when $2::int is not null then $2::int
				else w.vendor_organization
			end and w.id::text ILIKE
			case
				when $3::text <> '%""%' then $3::text
				else w.id::text
			end
			order by pp.add_to_warehouse_id desc
			limit 40 offset $4
		)	
		) payments
	from payment_products pp
	left join add_to_warehouse w on w.id = pp.add_to_warehouse_id
	where w.shop_id = 
	case
		when $1::int is not null then $1::int
		else w.shop_id
	end and w.vendor_organization =
	case
		when $2::int is not null then $2::int
		else w.vendor_organization
	end and w.id::text ILIKE
	case
		when $3::text <> '%""%' then $3::text
		else w.id::text
	end
	group by add_war_id
	order by pp.add_to_warehouse_id desc
	limit 40 offset $4
), d as (
	select
		add_war_id,
		round(sum(coalesce((summ->>'cash')::numeric, 0) + coalesce((summ->>'transfer')::numeric, 0)), 2) total
	from a
	left join lateral jsonb_array_elements(payments) as summ on true
	group by add_war_id
	order by add_war_id desc
), b as (
	select
	array (
		select
			jsonb_build_object (
			'number', row_number() over (order by w.id desc),
			'id', w.id,
			'shop', sh.name,
			'organization_name', c.name,
			'bank_code', c.bank_code,
			'invoice_number', c.invoice_number,
			'total', round(sum((contract->>'price')::numeric * (contract->>'amount')::numeric), 2),
			'payment', coalesce(d.total, 0),
			'percent_payment',
				round ((
					coalesce(d.total, 0) /
					(sum((contract->>'price')::numeric * (contract->>'amount')::numeric) / 100)
				),2),
			'payment_list', a.payments,    
			'vat_sum', w.vat_amount,
			'vat',
			case when p.is_vat = true then
				round((
					sum (
						((contract->>'price')::numeric * (contract->>'amount')::numeric) - 
						((contract->>'price')::numeric * (contract->>'amount')::numeric) /
						(w.vat_amount::numeric/100 + 1)
					)
				),2)    
			else 0
			end,
			'create_at', to_char(w.create_at, 'dd.mm.yyyy / hh24:mi')
		)
		from add_to_warehouse w
		left join lateral jsonb_array_elements(w.item) as contract on true
		left join d on d.add_war_id = w.id
		left join a on a.add_war_id = w.id
		left join products p on (contract->>'productId')::int = p.id
		left join companies c on w.vendor_organization = c.id
		left join types_company_activities tya on tya.id = c.type_activity_id
		left join shops sh on sh.id = w.shop_id
		where w.shop_id =
		case
			when $1::int is not null then $1::int
			else w.shop_id
		end and w.vendor_organization =
		case
			when $2::int is not null then $2::int
			else c.id
		end and w.id::text ILIKE
		case
			when $3::text <> '%""%' then $3::text
			else w.id::text
		end
		group by w.id, p.is_vat, d.total, tya.name, c.name, sh.name, a.payments, c.bank_code, c.invoice_number
		order by w.id desc 
		limit 40 offset $4 
	) as list,
	array (
		select
			DISTINCT
				jsonb_build_object (
					'id', c.id,
					'name', tca.name || ' ' || '«' || c.name || '»'
				)
			from companies c
			left join products p on p.company_id = c.id
			left join types_company_activities tca on c.type_activity_id = tca.id
			limit 2000
	) company_list,
	array (
		select
			jsonb_build_object (
				'id', sh.id,
				'name', sh.name,
				'address', substring(sh.address, 1, 15) || '...'
			)
		from shops sh
		order by sh.id
	) shop_list,
	jsonb_build_object(
		'count', count(w.id),
		'pages', case
					when count(w.id) = 0 then 0
					when count(w.id) < 41 then 1
					when (mod(count(w.id), 40)) > 1 then ((count(w.id) / 40) + 1)
					else (count(w.id) / 40) + 1
				end,
		'page', case
					when count(w.id) = 0 then 0
					else $4 / 40 + 1
				end 
	) more_info
	from add_to_warehouse w
		where w.shop_id =
		case
			when $1::int is not null then $1::int
			else w.shop_id
		end and w.vendor_organization =
		case
			when $2::int is not null then $2::int
			else w.vendor_organization
		end and w.id::text ILIKE
		case
			when $3::text <> '%""%' then $3::text
			else w.id::text
		end
)
select
	list,
	shop_list,
	company_list,
	more_info
from b;
`

module.exports.GETONEPDF = `
select
	w.vat_amount::text,
	w.id contract_number,
	tya.name || ' «' || c.name || '»' sending_organization_name,
	c.info->>'region' as organization_region,
	c.info->>'address' as organization_address,
	nullif(trim(to_char((c.info->>'telephone')::bigint,'999(99) 999-99-99')), '') as organization_tel,
	sh.name host_organization_name,
	sh.address host_organization_address,
	to_jsonb (
		array (
			select
				jsonb_build_object (
				'number', row_number() over (order by p.id),
				'id', row_number() over (order by p.id),
				'barcode', p.barcode,
				'name', p.name,
				'unit', u.name,
				'price', (contract->>'price')::real::text,
				'amount', (contract->>'amount')::real::text,
				'total', round(((contract->>'price')::numeric * (contract->>'amount')::numeric), 2)::real::text,
				'vat',
				case when p.is_vat = true then
					round((((contract->>'price')::numeric * (contract->>'amount')::numeric) - (((contract->>'price')::numeric * (contract->>'amount')::numeric))/ (w.vat_amount::numeric/100 + 1)), 2)::text
				else 0::text
				end	
			)
			from add_to_warehouse w
			left join lateral jsonb_array_elements(w.item) as contract on true
			inner join products p on (contract->>'productId')::int = p.id
			inner join units u on p.unit_id = u.id
			where w.id = $1
			order by p.id
		)
	) as list,
	sum (
		case when p.is_vat = true then
			round((((contract->>'price')::numeric * (contract->>'amount')::numeric) - (((contract->>'price')::numeric * (contract->>'amount')::numeric))/ (w.vat_amount::numeric/100 + 1)), 2)
		else 0
		end	
	)::real::text as vat,
	round((sum((contract->>'price')::numeric * (contract->>'amount')::numeric)), 2)::real::text as total,
	to_char(w.create_at, 'hh24:mi:ss / dd.mm.YYYY') as create_at,
	to_char(w.update_at, 'hh24:mi:ss / dd.mm.YYYY') as update_at
from add_to_warehouse w
inner join companies c on w.vendor_organization = c.id
inner join types_company_activities tya on tya.id = c.type_activity_id
inner join shops sh on w.shop_id = sh.id
left join lateral jsonb_array_elements(w.item) as contract on true
inner join products p on (contract->>'productId')::int = p.id
inner join units u on p.unit_id = u.id
where w.id = $1
group by w.id, c.id, sh.id, tya.name	
`

module.exports.ADDPAYMENT = `
select add_payment_warehouse($1, $2, $3);
`

module.exports.DELETEPAYMENT = `
select delete_payment_warehouse($1)
`

module.exports.GETPURCHASERETURN = `
with b as (
	select
	array (
		select
			jsonb_build_object (
			'number', row_number() over (order by w.id desc),
			'id', w.id,
			'shop', sh.name,
			'organization_name', tya.name || ' «' || c.name || '»',
			'create_at', to_char(w.create_at, 'dd.mm.yyyy / hh24:mi')
		)
		from purchase_returns w
		left join lateral jsonb_array_elements(w.item) as contract on true
		left join products p on (contract->>'productId')::int = p.id
		left join companies c on w.host_organization = c.id
		left join types_company_activities tya on tya.id = c.type_activity_id
		left join shops sh on sh.id = w.shop_id
		where w.shop_id =
		case
			when $1::int is not null then $1::int
			else w.shop_id
		end and w.host_organization =
		case
			when $2::int is not null then $2::int
			else c.id
		end and w.id::text ILIKE
		case
			when $3::text <> '%""%' then $3::text
			else w.id::text
		end
		group by w.id, p.is_vat, tya.name, c.name, sh.name
		order by w.id desc 
		limit 40 offset $4 
	) as list,
	array (
		select
			DISTINCT
				jsonb_build_object (
					'id', c.id,
					'name', tca.name || ' ' || '«' || c.name || '»'
				)
			from companies c
			left join products p on p.company_id = c.id
			left join types_company_activities tca on c.type_activity_id = tca.id
			limit 2000
	) company_list,
	array (
		select
			jsonb_build_object (
				'id', sh.id,
				'name', sh.name,
				'sh_address', substring(sh.address, 1, 15) || '...'
			)
		from shops sh
		order by sh.id
	) shop_list,
	jsonb_build_object(
		'count', count(w.id),
		'pages', case
					when count(w.id) = 0 then 0
					when count(w.id) < 41 then 1
					when (mod(count(w.id), 40)) > 1 then ((count(w.id) / 40) + 1)
					else (count(w.id) / 40) + 1
				end,
		'page', case
					when count(w.id) = 0 then 0
					else $4 / 40 + 1
				end 
	) more_info
	from purchase_returns w
		where w.shop_id =
		case
			when $1::int is not null then $1::int
			else w.shop_id
		end and w.host_organization =
		case
			when $2::int is not null then $2::int
			else w.host_organization
		end and w.id::text ILIKE
		case
			when $3::text <> '%""%' then $3::text
			else w.id::text
		end
)
select
	list,
	shop_list,
	company_list,
	more_info
from b;
`
module.exports.GETPURCHASEPDF = `
select
	w.id contract_number,
	tya.name || ' «' || c.name || '»' sending_organization_name,
	c.info->>'region' as organization_region,
	c.info->>'address' as organization_address,
	nullif(trim(to_char((c.info->>'telephone')::bigint,'999(99) 999-99-99')), '') as organization_tel,
	sh.name host_organization_name,
	sh.address host_organization_address,
	to_jsonb (
		array (
			select
				jsonb_build_object (
				'number', row_number() over (order by p.id),
				'id', row_number() over (order by p.id),
				'barcode', p.barcode,
				'name', p.name,
				'unit', u.name,
				'amount', (contract->>'amount')::real,
				'history', (
					select jsonb_build_object (
						'barcode', p.barcode,
						'name', p.name,
						'amount', (contract2->>'amount')::real,
						'unit', u.name
					)
					from purchase_add p_add
					left join lateral jsonb_array_elements(p_add.item) as contract2 on true
					where p_add.purchase_return_id = w.id and
					(contract->>'productId')::int = (contract2->>'productId')::int
				)	
			)
			from purchase_returns w
			left join lateral jsonb_array_elements(w.item) as contract on true
			inner join products p on (contract->>'productId')::int = p.id
			inner join units u on p.unit_id = u.id
			where w.id = $1
			order by p.id
		)
	) as list,
	to_char(w.create_at, 'hh24:mi:ss / dd.mm.YYYY') as create_at,
	to_char(w.update_at, 'hh24:mi:ss / dd.mm.YYYY') as update_at
from purchase_returns w
inner join companies c on w.host_organization = c.id
inner join types_company_activities tya on tya.id = c.type_activity_id
inner join shops sh on w.shop_id = sh.id
left join lateral jsonb_array_elements(w.item) as contract on true
inner join products p on (contract->>'productId')::int = p.id
inner join units u on p.unit_id = u.id
where w.id = $1
group by w.id, c.id, sh.id, tya.name	
`

module.exports.BALANCE = `
with
barcodes_true as (
	select array_agg(item) list
	from (
		select item
		from unnest((select array_agg(barcode) from products where company_id = null) || '{}'::text[]) as item
		group by item
		having count(*) > 1
	) s
), barcodes_all as (
	select
		array_agg(barcode) list
	from products
	where company_id = $5 
), a as (
	select
		p.barcode,
		p.name,
		round(sum((contract->>'amount')::numeric), 2) to_warehouse
	from barcodes_true, barcodes_all, add_to_warehouse w
	left join lateral jsonb_array_elements(w.item) as contract on true
	left join products p on (contract->>'productId')::int = p.id
	where 	
	case
		when $5::int is not null and array_length($1::text[], 1) is not null
		then p.barcode = any(barcodes_true.list)
		when $5::int is not null and array_length($1::text[], 1) is null
		then p.barcode = any(barcodes_all.list)
		else p.barcode = any($1::text[])
	end
	and w.shop_id = $4 and w.vendor_organization =
	case
		when $5::int is not null then $5::int
		else w.vendor_organization
	end and
	(w.create_at::date >=  $2::date and w.create_at::date <= $3::date)
	group by p.barcode, p.name
	order by p.name
), b as (
	select
		p.barcode,
		p.name,
		round(coalesce(nullif(sum((contract->>'amount')::numeric), 0), 0), 2) purchase
	from barcodes_true, barcodes_all, purchase_returns w
	left join lateral jsonb_array_elements(w.item) as contract on true
	left join products p on p.id = (contract->>'productId')::int 
	where 	
	case
		when $5::int is not null and array_length($1::text[], 1) is not null
		then p.barcode = any(barcodes_true.list)
		when $5::int is not null and array_length($1::text[], 1) is null
		then p.barcode = any(barcodes_all.list)
		else p.barcode = any($1::text[])
	end
	and w.shop_id = $4 and w.host_organization =
	case
		when $5::int is not null then $5::int
		else w.host_organization
	end and
	(w.create_at::date >=  $2::date and w.create_at::date <= $3::date)
	group by p.barcode, p.name
	order by p.name
), c as (
	select
		p.barcode,
		p.name,
		round(sum((contract->>'amount')::numeric), 2) sale
	from barcodes_true, barcodes_all, sales_check s_ch
	left join lateral jsonb_array_elements(s_ch.list) as contract on true
	left join products p on p.id = (contract->>'productId')::int
	left join cashbox cb on cb.id = s_ch.cashbox_id
	where 	
	case
		when $5::int is not null and array_length($1::text[], 1) is not null
		then p.barcode = any(barcodes_true.list)
		when $5::int is not null and array_length($1::text[], 1) is null
		then p.barcode = any(barcodes_all.list)
		else p.barcode = any($1::text[])
	end
	and cb.shop_id = $4 and
	(s_ch.create_at::date >= $2::date and s_ch.create_at::date <= $3::date)
	group by p.barcode, p.name
	order by p.name
), d as (
	select
		p.barcode,
		p.name,
		round(coalesce(nullif(sum((contract->>'amount')::numeric), 0), 0), 2) purchase_add
	from barcodes_true, barcodes_all, purchase_add w
	left join lateral jsonb_array_elements(w.item) as contract on true
	left join products p on p.id = (contract->>'productId')::int 
	where 	
	case
		when $5::int is not null and array_length($1::text[], 1) is not null
		then p.barcode = any(barcodes_true.list)
		when $5::int is not null and array_length($1::text[], 1) is null
		then p.barcode = any(barcodes_all.list)
		else p.barcode = any($1::text[])
	end and
	(w.create_at::date >= $2::date and w.create_at::date <= $3::date)
	group by p.barcode, p.name
	order by p.name
), h as (
select
	array (
		select jsonb_build_object (
			'number', row_number() over(order by p.id),
			'id', p.id,
			'barcode', p.barcode,
			'name', p.name,
			'to_warehouse', coalesce(a.to_warehouse, 0),
			'purchase', coalesce(b.purchase, 0),
			'purchase_add', coalesce(d.purchase_add, 0),
			'from_d', to_char($2::date, 'dd.mm.yyyy'),
			'to_d', to_char($3::date, 'dd.mm.yyyy'),
			'sale', coalesce(c.sale, 0),
			'total', coalesce(a.to_warehouse, 0) -
			(coalesce(b.purchase, 0) + coalesce(c.sale, 0)) + coalesce(d.purchase_add, 0)
		)
		from barcodes_true, barcodes_all, products p
		left join a on p.barcode = a.barcode
		left join b on p.barcode = b.barcode
		left join c on p.barcode = c.barcode
		left join d on p.barcode = d.barcode
		where 	
		case
			when $5::int is not null and array_length($1::text[], 1) is not null
			then p.barcode = any(barcodes_true.list)
			when $5::int is not null and array_length($1::text[], 1) is null
			then p.barcode = any(barcodes_all.list)
			else p.barcode = any($1::text[])
		end
		order by p.id
	) list,
	array (
		select
			DISTINCT
				jsonb_build_object (
					'id', c.id,
					'name', tca.name || ' ' || '«' || c.name || '»'
				)
			from companies c
			left join products p on p.company_id = c.id
			left join types_company_activities tca on c.type_activity_id = tca.id
			limit 2000
	) company_list,
	array (
		select
			jsonb_build_object (
				'id', sh.id,
				'name', sh.name,
				'sh_address', substring(sh.address, 1, 15) || '...'
			)
		from shops sh
		order by sh.id
	) shop_list
) select
	list,
	company_list,
	shop_list
from h
`


module.exports.TEST = `
select array_agg(id) from products where company_id = 9

select DISTINCT 

select '{}'::int[] is null



array_length('{}'::text[], 1) is null
select array_length('{38,39,55,72}'::int[], 1) is null


select
		p.barcode,
		p.name,
		round(sum((contract->>'amount')::numeric), 2) to_warehouse
	from add_to_warehouse w
	left join lateral jsonb_array_elements(w.item) as contract on true
	left join products p on (contract->>'productId')::int = p.id
	where p.barcode = any($1::text[])
	group by p.barcode, p.name



with 	select
		p.barcode,
		p.name,
		round(sum((contract->>'amount')::numeric), 2) to_warehouse
	from barcodes_true, barcodes_all, add_to_warehouse w
	left join lateral jsonb_array_elements(w.item) as contract on true
	left join products p on (contract->>'productId')::int = p.id
	where 	
	case
		when $5::int is not null and array_length('{}'::text[], 1) is not null
		then p.barcode = any(barcodes_true.list)
		when $5::int is not null and array_length('{}'::text[], 1) is null
		then p.barcode = any(barcodes_all.list)
		else p.barcode = any('{}'::text[])
	end
	and w.shop_id = $4 and w.vendor_organization =
	case
		when $5::int is not null then $5::int
		else w.vendor_organization
	end and
	(w.create_at::date >=  '2022-07-04'::date and w.create_at::date <= '2023-02-05'::date)
	group by p.barcode, p.name
	order by p.name


	array['4780016370072, 4780044571464, 46981814569']
`