module.exports.CREATE = `
insert into wholesale_customers (
	first_name,
	last_name,
	company_name,
	bank_code,
	invoice_number,
	passport_id,
	contact
) values ($1, $2, $3, $4, $5, $6, $7)
returning id
`

module.exports.CREATENASIYATRADE = `
wholesale_customer_id
product_list
close_at
client_id

create or replace function create_nasiya_trade (v1 text, v2 jsonb, v3 date)
	returns jsonb as
$$
	declare
		client_id int := (
			select
				id
			from wholesale_customers
			where concat(passport_id, contact) ILIKE v1
		);
		result_id int;
		x_idx jsonb;
	begin
		if count(user_name_idx) = 0 then
			x_idx := '{"error": true, "message": "Mijoz topilmadi"}'::jsonb;
		else
			with new_nasiya_trade as (
				insert into nasiya_trade (
					wholesale_customer_id,
					product_list,
					close_at
				) values (client_id, v2, v3)
				returning id, close_at, product_list
			) insert into nasiya_trade_payment (
				nasiya_trade_id,
				summ,
				date_of
			) values (
					( select id from new_nasiya_trade ),
					(
						select
							sum((value ->> 'count')::numeric * (value->>'price')::numeric)
						from new_nasiya_trade
						cross join lateral jsonb_array_elements(product_list)
					),
					( select
						(create_at + interval '1 month')::date
					  from new_nasiya_trade	
					)
				 ) returning id	 
			into result_id;	 
			if (count(result_id) > 0) then
				x_idx := '{"error": false, "message": "Muvaffaqiyatli kiritildi"}'::jsonb;
			else
				x_idx := '{"error": true, "message": "Qandaydir xatolik yuzaga keldi"}'::jsonb;
			end if;	
			return x_idx;		
		end if;
		return x_idx;
	end;
$$
language plpgsql;

select create_nasiya_trade('AA7841511', )

'{
[product_id]

}'

`

module.exports.TEST =  `
with a as (
	insert into nasiya_trade(
		wholesale_customer_id,
		product_list,
		close_at
	) values ($1, $2, $3)
	returning id, create_at, product_list
) insert into nasiya_trade_payment (
	nasiya_trade_id,
	summ,
	date_of
)
	values
		id,
		sum((value ->> 'count')::numeric * (value->>'price')::numeric),
		(create_at + interval '1 month')::date
from a
cross join lateral jsonb_array_elements(product_list)




`