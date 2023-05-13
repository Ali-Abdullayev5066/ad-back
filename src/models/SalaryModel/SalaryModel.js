module.exports.SALARY = `
with a as (
	select
		distinct on (p.id)
		sch.personal_id,
		to_char((date_trunc('month', concat(sch.year, '-', sch.month, '-', '01')::date) +
		interval '1 month - 1 day')::date, 'dd')::int - 
		case
			when (schl->>'came')::int = 0 then count((schl->>'came')::int)
			when (schl->>'came')::int <> 0 then 0
			else 0
		end days
	from
	schedules sch
	left join lateral jsonb_array_elements(sch.schedule_list) schl on true
	left join personals p on p.id = sch.personal_id
	where sch.year = $1 and sch.month = $2 and
	p.shop_id =
	case
		when $3::int is not null then $3::int
		else null::int
	end
	group by sch.id, (schl->>'came'), p.id
	order by p.id
), b as (
	select
		f.personal_id,
		sum(f.summ) summ
	from fines f
	where date_trunc('month', concat($1, '-', $2, '-', '01')::date) = date_trunc('month', f.date_of::date)
	group by f.personal_id
), c as (
	select
		bn.personal_id,
		sum(bn.summ) summ
	from bonuses bn
	where date_trunc('month', concat($1, '-', $2, '-', '01')::date) = date_trunc('month', bn.date_of::date)
	group by bn.personal_id
), d as (
	select
		sch.personal_id,
		case
			when (att->>'came')::int = 1 then count(att->>'came')::int
			else 0
		end came_days
	from
	attendance at
	left join lateral jsonb_array_elements(at.attendance_list) att on true
	left join schedules sch on sch.id = at.schedule_id
	left join personals p on p.id = sch.personal_id
	where sch.year = $1 and sch.month = $2 and
	p.shop_id =
	case
		when $3::int is not null then $3::int
		else null::int
	end
	group by sch.id, (att->>'came'), p.id
	order by p.id
), e as (
	select
		sch.personal_id,
		sch.id,
		round((sch.salary_sum * 100000)::numeric, 2) salary_sum
	from schedules sch
	left join personals p on p.id = sch.personal_id
	where sch.year = $1 and sch.month = $2 and
	p.shop_id =
	case
		when $3::int is not null then $3::int
		else null::int
	end
), f as (
	select
		vsl.personal_id,
		case
			when p.personal_create_at::date <= current_date - interval '8 year' then
			((e.salary_sum * 0.8) / a.days) * (vsl.end_day - vsl.start_day)::int 
			else ((e.salary_sum * 0.6) / a.days) * (vsl.end_day - vsl.start_day)::int
		end f_summ
	from vacation_sick_leave vsl
	left join personals p on p.id = vsl.personal_id
	left join e on e.personal_id = vsl.personal_id
	left join a on a.personal_id = vsl.personal_id
	where date_trunc('month', concat($1, '-', $2, '-', '01')::date) = date_trunc('month', vsl.start_day) and vsl.reason = 3
), g as (
	select
		vsl.personal_id,
		round((e.salary_sum / 2), 2) vac_sum
	from vacation_sick_leave vsl
	left join personals p on p.id = vsl.personal_id
	left join e on e.personal_id = vsl.personal_id
	where date_trunc('month', concat($1, '-', $2, '-', '01')::date) = date_trunc('month', vsl.start_day) and vsl.reason = 2	
), i as (
	select
		av_l.personal_id,
		av_l.summ
	from avans av
	left join avans_list av_l on av.id = av_l.avans_id
	where
		date_trunc('month', concat($1, '-', $2, '-', '01')::date) = date_trunc('month', av.date_of) and
		av_l.received = true
), h as (
	select
		to_jsonb(
		array (
			select jsonb_build_object (
				'number', row_number() over(order by r.id),
				'id', p.id,
				'last_name', p.last_name,
				'first_name', p.first_name,
				'rank_name', r.name,
				'salary_sum', coalesce(nullif(e.salary_sum, 0), s.amount),
				'work_days', a.days,
				'came_days', d.came_days,
				'vac_sum', g.vac_sum,
				'f_summ', f.f_summ,
				'salary_of_month', round((d.came_days * (coalesce((e.salary_sum), 0) / a.days))),
				'avans',
					case
						when round((d.came_days * (coalesce((e.salary_sum), 0) / a.days))) >= 50000 then 300000
					end,
				'received_avans', coalesce(nullif(i.summ, 0), 0),     
				'fine', round((b.summ )::numeric, 2),
				'bonus', round((c.summ )::numeric, 2),
				'total', round((coalesce(nullif(d.came_days * (coalesce(nullif(e.salary_sum, 0), 0) / a.days), 0), 0) +
						coalesce(nullif(c.summ, 0), 0) +
						coalesce(nullif(g.vac_sum, 0), 0) -
						coalesce(nullif(i.summ, 0), 0) +
						coalesce(nullif(f.f_summ, 0), 0) -
						coalesce(nullif(b.summ, 0), 0)), 0)
						
			)
			from personals p
			left join salaries s on p.salary_id = s.id
			left join ranks r on r.id = s.rank_id
			left join a on a.personal_id = p.id
			left join b on b.personal_id = p.id
			left join c on c.personal_id = p.id 
			left join d on d.personal_id = p.id 
			left join e on e.personal_id = p.id 
			left join f on f.personal_id = p.id 
			left join g on g.personal_id = p.id
			left join i on i.personal_id = p.id
			where p.shop_id =
			case
				when $3::int is not null then $3::int
				else null::int
			end and (p.status <> 0 )
			group by p.id, r.id, a.days, b.summ, c.summ, d.came_days, e.salary_sum, f.f_summ, g.vac_sum, s.amount, i.summ
			order by r.id
		)
	) list
) select
	to_jsonb(
		array (
			select jsonb_build_object(
				'number', row_number() over(order by id),
				'id', id,
				'name', name,
				'address', address
			)
			from shops
			order by id
		)
	) shop_list,
	(
		select jsonb_build_object (
			'count', count(a.personal_id),
			'personal_count', ( 
				select
					count(id)
				from personals
				where shop_id =
				case
					when $3::int is not null then $3::int
					else null::int
				end
			)
		) from a
	) more_info,
	(
		select jsonb_build_object (
			'id', id,
			'status', status
		)
		from given_salary
		where shop_id =
		case
			when $3::int is not null then $3::int
			else null::int
		end and year = $1 and month = $2
	) status,
	h.list,
	jsonb_build_object (
		'vac_sum', sum((value ->> 'vac_sum')::numeric),
		'f_summ', sum((value ->> 'f_summ')::numeric),
		'salary_of_month', sum((value ->> 'salary_of_month')::numeric),
		'fine', sum((value ->> 'fine')::numeric),
		'bonus', sum((value ->> 'bonus')::numeric),
		'avans', sum((value ->> 'received_avans')::numeric),
		'total', sum((value ->> 'total')::numeric)
	) footer_info
	from h
	cross join lateral jsonb_array_elements(h.list)
	group by h.list
`

module.exports.GETSHOPLIST = `
select
	id,
	name
from shops
order by id 
`

module.exports.CREATEGIVENSALARY = `
	select create_given_salary($1, $2, $3, $4, $5, $6, $7, $8);
`

module.exports.GETGIVENSALARY = `
	select get_given_salary_list($1, $2, $3)
`

module.exports.DELETEGIVENSALARY = `
	select delete_avans($1, $2::int);
`

module.exports.UPDGIVENSALARY = `
update given_salary
	set
		status =
		case
			when $1 > 0 and status = 1 then 2
			else 1
		end,
		status_check = 2
	where id::text = $2
returning id, status
`

module.exports.CREATEAVANS = `
with avn as (
	insert into avans (
	shop_id,
	total,
	date_of
) values ($1, $2, $3)
returning id
) insert into avans_list (
	avans_id,
	personal_id,
	summ
) select
	id,
	(value->>'personal_id')::int,
	(value->>'summ')::int
from avn
cross join lateral jsonb_array_elements($4::jsonb)
where (value->>'summ')::int > 0
returning id
`

module.exports.GETAVANS = `
with a as (
	select
		id,
		total,
		status,
		status_check,
		to_char(date_of, 'YYYY-MM') date_of,
		to_char(create_at, 'hh24:mi / dd.mm.yyyy') create_at
	from avans
	where date_trunc('month', concat($1::text, '-', $2::text, '-', '01')::date) = date_trunc('month', date_of) and shop_id = $3
), b as (
	select
		to_jsonb(
			array(
				select jsonb_build_object(
					'number', row_number() over(order by r.id),
					'id', p.id,
					'last_name', p.last_name,
					'first_name', p.first_name,
					'rank_name', r.name,
					'summ', av_l.summ,
					'take', av_l.received
				)
				from avans_list av_l
				left join personals p on p.id = av_l.personal_id
				left join salaries s on p.salary_id = s.id
				left join ranks r on r.id = s.rank_id
				left join a on a.id::text = av_l.avans_id::text
				where av_l.avans_id = a.id	
			)
		) list
), c as (
	select
	to_jsonb(
		array (
			select jsonb_build_object(
				'number', row_number() over(order by id),
				'id', id,
				'name', name,
				'address', address
			)
			from shops
			order by id
		)
	) shop_list
)
select
	b.list list,
	c.shop_list shop_list,
	total,
	jsonb_build_object(
		'status', status,
		'id', id,
		'date_of', date_of
	) status,
	status_check,
	create_at
	from a, b, c	
`

module.exports.UPDAVANS = `
update avans
	set
		status =
			case
				when $1 > 0 and status = 1 then 2
				else 1
			end,
		status_check = 2
	where id::text = $2
returning id, status
`