module.exports.GETCLOSEDCASHBOXSES = `
with a as (
	select
		py.id,
        py.create_at::date create_at,
		sum(round(((value->>'price')::numeric * (value->>'amount')::numeric), 2)) - (py.card_payment + py.bonus_payment) cash_array_total
	from sales_check s
	cross join lateral jsonb_array_elements(s.list)
	inner join payments py on py.sales_check_id = s.id
	inner join cashbox cb on cb.id = s.cashbox_id
	where cb.shop_id =
    case
        when $1::int is not null then $1::int
        else null::int
    end and
    case
        when $2::text = 'month' then date_trunc('month', py.create_at) =  DATE_TRUNC('month', current_date)
        when $2::text = 'weekend' then py.create_at >=  NOW() - INTERVAL '7 days'
        when $2::text = 'day' then py.create_at::date = $3::date
        else py.create_at::date = $3::date
    end
	group by py.id,  py.create_at::date
   order by py.create_at::date, py.id
), b as (
	select
		py.id,
        py.create_at::date create_at,
		sum(round((py.card_payment), 2))::numeric card_payment
	from payments py
	inner join sales_check s on s.id = py.sales_check_id
	inner join cashbox cb on cb.id = s.cashbox_id
	where cb.shop_id =
    case
        when $1::int is not null then $1::int
        else null::int
    end and
    case
        when $2::text = 'month' then date_trunc('month', py.create_at) =  DATE_TRUNC('month', current_date)
        when $2::text = 'weekend' then py.create_at >=  NOW() - INTERVAL '7 days'
        when $2::text = 'day' then py.create_at::date = $3::date
        else py.create_at::date = $3::date
    end
	group by py.id, py.create_at::date
    order by py.create_at::date, py.id
) select
	(
		select
			jsonb_build_object (
				'id', sts_m_t.id,
				'status', sts_m_t.status,
				'close_date', to_char(sts_m_t.until_day, 'YYYY-mm-dd')
			)
		from staus_main_treasury sts_m_t
		where sts_m_t.shop_id =
        case
            when $1::int is not null then $1::int
            else null::int
        end
	) status,
	case
		when null::date is not null then to_char(null::date, 'YYYY-mm-dd')
		else to_char(current_date, 'YYYY-mm-dd')
	end get_date,
	jsonb_build_object (
		'card_total', coalesce((sum(cshr.uzcard)::numeric), 0) + coalesce((sum(cshr.humo)::numeric), 0),
		'diff_total', sum(cshr.diff) * -1,
		'cash_with_diff', coalesce(sum(value::float), 0) + coalesce((sum(cshr.diff)::numeric), 0),
		'total', coalesce((sum(value::float)), 0) + coalesce((sum(cshr.diff)::numeric), 0) + coalesce((sum(cshr.uzcard)::numeric), 0) + coalesce((sum(cshr.humo)::numeric), 0) + coalesce((sum(cshr.fine_cash)::numeric), 0),
		'fine_cash', coalesce((sum(cshr.fine_cash)::numeric), 0)
	) list,
	(
		select
			jsonb_build_object (
				'name', p.last_name || ' ' || p.first_name,
				'contact', nullif(trim(to_char(p.contact::bigint,'999(99) 999-99-99')), '')
			)
		from personals p
		where p.salary_id in (10, 11) and p.shop_id =
        case
            when $1::int is not null then $1::int
            else null::int
        end
        limit 1
	) info_personals,
	(
		select
			jsonb_build_object (
				'cash_payment', cast(sum(a.cash_array_total) as DOUBLE PRECISION),
				'card_payment', cast(sum(b.card_payment) as DOUBLE PRECISION),
				'total', cast((sum(a.cash_array_total) + sum(b.card_payment)::numeric) as DOUBLE PRECISION)
			)
		from a, b
		where a.id = b.id
	) real_list,
	(
		select
			jsonb_build_object (
				'incomes', coalesce((sum(csh_inc.summ)::numeric), 0) ,
				'expenses', (
					select
						coalesce((sum(csh_exp.summ)::numeric), 0)
					from cash_expense csh_exp
					where csh_exp.shop_id =
                    case
                        when $1::int is not null then $1::int
                        else null::int
                    end and
                    case
                        when $2::text = 'month' then date_trunc('month', csh_exp.register_date) =  DATE_TRUNC('month', current_date)
                        when $2::text = 'weekend' then csh_exp.register_date >=  NOW() - INTERVAL '7 days'
                        when $2::text = 'day' then csh_exp.register_date::date = $3::date
                        else csh_exp.register_date::date = $3::date
                    end
				)
			)
		from cash_income csh_inc
		where csh_inc.shop_id =
        case
            when $1::int is not null then $1::int
            else null::int
        end and
        case

            when $2::text = 'month' then date_trunc('month', csh_inc.register_date) =  DATE_TRUNC('month', current_date)
            when $2::text = 'weekend' then csh_inc.register_date >=  NOW() - INTERVAL '7 days'
            when $2::text = 'day' then csh_inc.register_date::date = $3::date
            else csh_inc.register_date::date = $3::date
        end 
	) income_expense,
	to_jsonb(
		array (
		select
			jsonb_build_object (
				'number', row_number () over (order by cb.cash_number, cshr.id desc),
				'id', cshr.id,
                'create_at', cshr.register_date::date,
				'cashier_id', csh.id,
				'cash_number', 'G''AZNA - ' || cb.cash_number,
				'personal_name', pr.last_name || ' ' || pr.first_name,
				'status', cshr.status
			)
		from cash_register cshr
		left join cashbox cb on cb.id = cshr.cashbox_id
		left join cashiers csh on csh.id = cshr.cashier_id
		left join personals pr on pr.id = csh.personal_id
		where cb.shop_id =
        case
            when $1::int is not null then $1::int
            else null::int
        end and
        case

            when $2::text = 'month' then date_trunc('month', cshr.register_date) =  DATE_TRUNC('month', current_date)
            when $2::text = 'weekend' then cshr.register_date >=  NOW() - INTERVAL '7 days'
            when $2::text = 'day' then cshr.register_date::date = $3::date
            else cshr.register_date::date = $3::date
        end 
		order by cshr.register_date::date, cb.cash_number, cshr.id desc
		)
	) cash_register_list,
    to_jsonb(
        array (
        select
            jsonb_build_object (
                'id', cb.id,
                'cash_number', 'G''AZNA - ' || cb.cash_number
            )
        from cashbox cb 
        where cb.shop_id =
        case
            when $1::int is not null then $1::int
            else null::int
        end
        order by cb.cash_number
        )
    ) cash_box_list,
	to_jsonb(
		array (
		select
			jsonb_build_object (
				'number', row_number () over (order by cinc.register_date::date, cinc.id desc),
                'create_at', cinc.register_date::date,
				'summ', cinc.summ,
				'comment', cinc.comment
			)
		from cash_income cinc
		where cinc.shop_id =
        case
            when $1::int is not null then $1::int
            else null::int
        end and
        case

            when $2::text = 'month' then date_trunc('month', cinc.register_date) =  DATE_TRUNC('month', current_date)
            when $2::text = 'weekend' then cinc.register_date >=  NOW() - INTERVAL '7 days'
            when $2::text = 'day' then cinc.register_date::date = $3::date
            else cinc.register_date::date = $3::date
        end 
		order by cinc.register_date::date, cinc.id desc
		)
	) income_list,
	to_jsonb(
		array (
		select
			jsonb_build_object (
				'number', row_number () over (order by cexp.register_date::date, cexp.id desc),
                'create_at', cexp.register_date::date,
				'summ', cexp.summ,
				'comment', cexp.comment
			)
		from cash_expense cexp
		where cexp.shop_id =
        case
            when $1::int is not null then $1::int
            else null::int
        end and
        case

            when $2::text = 'month' then date_trunc('month', cexp.register_date) =  DATE_TRUNC('month', current_date)
            when $2::text = 'weekend' then cexp.register_date >=  NOW() - INTERVAL '7 days'
            when $2::text = 'day' then cexp.register_date::date = $3::date
            else cexp.register_date::date = $3::date
        end 
		order by cexp.register_date::date, cexp.id desc
		)
	) expense_list,
    array (
        select
            jsonb_build_object (
                'id', sh.id,
                'name', sh.name,
                'address', substring(sh.address, 1, 15) || '...'
            )
        from shops sh
        order by sh.id
    ) shop_list
FROM cash_register cshr
left JOIN LATERAL jsonb_array_elements(cshr.cash) ON TRUE
inner join cashbox cb on cb.id = cshr.cashbox_id
where cb.shop_id =
        case
            when $1::int is not null then $1::int
            else null::int
        end and
        case
            when $2::text = 'month' then date_trunc('month', cshr.register_date) =  DATE_TRUNC('month', current_date)
            when $2::text = 'weekend' then cshr.register_date >=  NOW() - INTERVAL '7 days'
            when $2::text = 'day' then cshr.register_date::date = $3::date
            else cshr.register_date::date = $3::date
        end 
`

module.exports.CHANGESTATUS = `
update staus_main_treasury
	set
		status = $1,
		until_day = $2
	where id::text = $3
returning id		
`

module.exports.GETCASHREG = `
with a as (
	select
		py.id,
		s.cashier_id,
		sum(round(((value->>'price')::numeric * (value->>'amount')::numeric), 2)) - (py.card_payment + py.bonus_payment) cash_array_total
	from sales_check s
	cross join lateral jsonb_array_elements(s.list)
	inner join payments py on py.sales_check_id = s.id
	inner join cashbox cb on cb.id = s.cashbox_id
	where cb.shop_id = $1 and s.status = 2 and
	py.create_at::date = $2::date and s.cashier_id = $4
	group by s.id, py.id
	order by s.id	
), b as (
	select
		py.id,
		sum(round((py.card_payment), 2))::numeric card_payment
	from payments py
	inner join sales_check s on s.id = py.sales_check_id
	inner join cashbox cb on cb.id = s.cashbox_id
	where cb.shop_id = $1 and s.status = 2 and 
	py.create_at::date = $2::date and s.cashier_id = $4
	group by py.id
) select
	round((cast(sum(a.cash_array_total) as DOUBLE PRECISION)::numeric), 2)::real cash_payment,
	round((cast(sum(b.card_payment) as DOUBLE PRECISION)::numeric), 2)::real card_payment,
	round((cast((sum(cash_array_total) + sum(b.card_payment)::numeric) as DOUBLE PRECISION)::numeric), 2)::real total,
	(
		select
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
	) list_cash_reg
from a, b
where a.id = b.id
group by a.cashier_id
`

module.exports.GETCASHBOX = `
with a as (
    select
        py.id,
        py.create_at::date create_at,
        sum(round(((value->>'price')::numeric * (value->>'amount')::numeric), 2)) - (py.card_payment + py.bonus_payment) cash_array_total
    from sales_check s
    cross join lateral jsonb_array_elements(s.list)
    inner join payments py on py.sales_check_id = s.id
    inner join cashbox cb on cb.id = s.cashbox_id
    where cb.shop_id =
    case
        when $1::int is not null then $1::int
        else null::int
    end and
    case
        when $2::text = 'month' then date_trunc('month', py.create_at) =  DATE_TRUNC('month', current_date)
        when $2::text = 'weekend' then py.create_at >=  NOW() - INTERVAL '7 days'
        when $2::text = 'day' then py.create_at::date = $3::date
        else true
    end and cb.id = $4
    group by py.id,  py.create_at::date
    order by py.create_at::date, py.id
), b as (
    select
        py.id,
        py.create_at::date create_at,
        sum(round((py.card_payment), 2))::numeric card_payment
    from payments py
    inner join sales_check s on s.id = py.sales_check_id
    inner join cashbox cb on cb.id = s.cashbox_id
    where cb.shop_id =
    case
        when $1::int is not null then $1::int
        else null::int
    end and
    case
        when $2::text = 'month' then date_trunc('month', py.create_at) =  DATE_TRUNC('month', current_date)
        when $2::text = 'weekend' then py.create_at >=  NOW() - INTERVAL '7 days'
        when $2::text = 'day' then py.create_at::date = $3::date
        else true
    end and cb.id = $4
    group by py.id,  py.create_at::date
    order by py.create_at::date, py.id
) select
    cast(sum(a.cash_array_total) as DOUBLE PRECISION) cash_payment,
    cast(sum(b.card_payment) as DOUBLE PRECISION) card_payment,
    cast((sum(a.cash_array_total) + sum(b.card_payment)::numeric) as DOUBLE PRECISION) total
    from a, b
    where a.id = b.id
`