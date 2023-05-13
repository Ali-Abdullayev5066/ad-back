const pp = [
{
    "workerId" : 1,
    "month" : 2,
    "year" : 2022,
    "scheduleList" : [
        {
            "came" : 0,
            "day" : 1
        },
        {
            "came" : 1,
            "day" : 2
        },
        {
            "came" : 1,
            "day" : 3
        },
        {
            "came" : 1,
            "day" : 4
        },
        {
            "came" : 1,
            "day" : 5
        },
        {
            "came" : 0,
            "day" : 6
        },
        {
            "came" : 1,
            "day" : 7
        },
        {
            "came" : 1,
            "day" : 8
        },
        {
            "came" : 1,
            "day" : 9
        },
        {
            "came" : 1,
            "day" : 10
        },
        {
            "came" : 1,
            "day" : 11
        },
        {
            "came" : 1,
            "day" : 12
        },
        {
            "came" : 1,
            "day" : 13
        },
        {
            "came" : 1,
            "day" : 14
        },
        {
            "came" : 1,
            "day" : 15
        },
        {
            "came" : 1,
            "day" : 16
        },
        {
            "came" : 1,
            "day" : 17
        },
        {
            "came" : 1,
            "day" : 18
        },
        {
            "came" : 1,
            "day" : 19
        },
        {
            "came" : 0,
            "day" : 20
        },
        {
            "came" : 1,
            "day" : 21
        },
        {
            "came" : 1,
            "day" : 22
        },
        {
            "came" : 1,
            "day" : 23
        },
        {
            "came" : 1,
            "day" : 24
        },
        {
            "came" : 0,
            "day" : 25
        },
        {
            "came" : 1,
            "day" : 26
        },
        {
            "came" : 1,
            "day" : 27
        },
        {
            "came" : 1,
            "day" : 28
        }
    ]
}	
]

let ss = []
for (let i = 0; i < (new Date((new Date).getFullYear(), (new Date).getMonth() + 1, 0).getDate()); i++) {
	if (!pp[i]) {
		ss.push(undefined)
	}
}
for (let i = 0; i < (new Date((new Date).getFullYear(), (new Date).getMonth() + 1, 0).getDate()); i++) {
	if (pp[i]) {
		ss.push(pp[i])
	}
}

console.log(ss)

