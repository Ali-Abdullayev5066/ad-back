module.exports.INSERTADMIN = `
	insert into
		admins (
			shop_id,
			username,
			password,
			is_admin,
			status
		) values (
			$1,
			lower($2),
			crypt($3, gen_salt('bf', 8)),
			false,
			$4
		)
	returning 
	id, shop_id, username, is_admin, status	
`

module.exports.SELECTADMIN = `
	select verify_auth($1, $2);
`

module.exports.GETALL = `
with a
	as (
	select
	array (
		select
			jsonb_build_object (
				'number', row_number() OVER (order by a.shop_id, a.status),
				'id', a.id,
				'branch', sh.name,
				'username', a.username,
				'avatar', a.image,
				'rank', ads.name,
				'status', a.status		
			)
		from admins a
		inner join shops sh on a.shop_id = sh.id
		inner join admin_status ads on ads.id = a.status 
		where a.shop_id =
		case
			when $1::int is not null then $1::int
			else sh.id
		end and a.is_admin <> true
		order by a.shop_id, a.status
		limit 40 offset $2
	) list,
	array (
		select jsonb_build_object (
			'id', id,
			'name', name
		)
		from admin_status
	) rank_list,
	array (
		select
			jsonb_build_object (
				'id', sh.id,
				'name', sh.name
			)
			from shops sh
			order by sh.id
	) shop_list,
	jsonb_build_object(
		'count', count(a.id),
		'pages', case
					when count(a.id) = 0 then 0
					when count(a.id) < 41 then 1
					when (mod(count(a.id), 40)) >= 1 then ((count(a.id) / 40) + 1)
					else (count(a.id) / 40)
				end,
		'page', case
					when count(a.id) = 0 then 0
					else $2 / 40 + 1
				end 
	) more_info
from admins a
	inner join shops sh on a.shop_id = sh.id
	where a.shop_id =
	case
		when $1::int is not null then $1::int
		else sh.id
	end and a.is_admin <> true
) select
	more_info,
	shop_list,
	list,
	rank_list
from a;
`

module.exports.DELETE = `
	delete from admins
		where id = $1 and is_admin = false
	returning id
`