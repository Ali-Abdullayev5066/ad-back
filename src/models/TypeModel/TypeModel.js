module.exports.ADD = `
	insert into types (
		name
	) values (lower($1))
	returning id
`

module.exports.PUT = `
	update types
		set
			name = lower($1)
	where id = $2
	returning id		
`

module.exports.DELETE = `
	delete from
		types
	where id = $1
	returning id	
`

module.exports.ALL =  `
with a
	as (
	select
	array (
		select
			jsonb_build_object (
					'number', row_number() OVER (order by t.name),
					'id', t.id,
					'name', t.name
				)
		from types t
			where t.name ilike
			case
				when $1::text <> '%""%'::text then $1
				else t.name
			end
			order by t.name
			limit 40 offset $2
	) list,
	jsonb_build_object(
		'count', count(t.id),
		'pages', case
					when count(t.id) = 0 then 0
					when count(t.id) < 11 then 1
					when (mod(count(t.id), 40)) >= 1 then ((count(t.id) / 40) + 1)
					else (count(t.id) / 40)
				end,
		'page', case
					when count(t.id) = 0 then 0
					else $2 / 40 + 1
				end 
	) more_info
from types t
where t.name ilike
	case
		when $1::text <> '%""%' then $1
		else t.name
	end
) select
	more_info,
	list
from a;
`