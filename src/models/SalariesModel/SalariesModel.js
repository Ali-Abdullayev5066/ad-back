module.exports.ADD = `
	insert into salaries (
		category,
		rank_id,
		amount
	) values ($1, $2, $3)
	returning id
`

module.exports.PUT = `
	update salaries
		set
			amount = $1
	where id = $2
	returning id		
`

module.exports.DELETE = `
	delete from
		salaries
	where id = $1
	returning id
`

module.exports.GET = `
	select
		r.id salary_id,
		r.name,
		case
			when sl.category = 0 then 'stajer'
			else sl.category::text
		end as category,
		sl.amount,
		to_char(sl.salary_create_at, 'dd-mm-yyyy hh24:mi') create_at,
		to_char(sl.salary_update_at, 'dd-mm-yyyy hh24:mi') update_at
	from salaries sl
	inner join ranks r on r.id = sl.rank_id
	where sl.rank_id = 1 and sl.category = 3
`

module.exports.ALL = `
with a
	as (
	select
	array (
		select
			jsonb_build_object (
					'salary_id', slr.id,
					'rank', r.name,
					'category', slr.category,
					'amount', to_char(slr.amount, 'FM999G999G999') || ' ' || 'söm',
					'create', to_char(slr.salary_create_at, 'dd-mm-yyyy'),
					'update', to_char(slr.salary_update_at, 'dd-mm-yyyy')
				)
		from salaries slr
			inner join ranks r on r.id = slr.rank_id
			where r.id = 
			case
				when $1::int is not null then $1::int
				else r.id
			end
			order by slr.rank_id, slr.category
			limit 40 offset $2
	) list,
	jsonb_build_object(
		'count', count(slr.id),
		'pages', case
					when count(slr.id) = 0 then 0
					when count(slr.id) < 41 then 1
					when (mod(count(slr.id), 40)) >= 1 then ((count(slr.id) / 40) + 1)
					else (count(slr.id) / 40)
				end,
		'page', case
					when count(slr.id) = 0 then 0
					else $2 / 40 + 1
				end 
	) more_info
from salaries slr
inner join ranks r on r.id = slr.rank_id
where r.id = 
case
	when $1::int is not null then $1::int
	else r.id
end
) select
	more_info,
	list
from a;
`