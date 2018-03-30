# physdash to cups_quota API protocol
[cups_quota](https://github.com/physcip/cups_quota) provides a simple HTTP interface to retrieve information about how many free pages a user has left over for printing.

## Request Command
```
GET https://[HOST:PORT]/path_to_quota/getquota?username=USERNAME
```

In our case, our `cups_quota` installation is at `https://www.physcip.uni-stuttgart.de/quota` by default, so the following command can be used to retrieve the quota for user `florian`:

```
curl https://www.physcip.uni-stuttgart.de/quota/getquota?username=florian
```

## Responses
The response is always a string containing a JSON-encoded data structure with the following format:
```
{
	"pagecount" : number,
	"pagequota" : number,
	"increasecount" : number,
	"nextincrease" : string,
	"lastjob" : string,
	-- OR --
	"error" : string
}
```

The JSON contains *either* all the values from `increasecount` to `lastjob` *or* `error`. The client must therefore first check if `error` is contained in the response JSON and then decide accordingly whether to display an error message or to show the quota information.

### Response variable description
Variable | Description
---: | ---
`pagecount` | Number of pages user has already printed
`pagequota` | Number of pages user is allowed to print in total
`increasecount` | Number of free pages that a user gets every month
`nextincrease` | Date in `%Y-%m-%d` format at which user will get new free pages
`lastjob` | Date in `%Y-%m-%d` format at which the last print job for the given user was executed
`error` | String `USER_NOT_FOUND` if the given user was not found in the database (hasn't executed any print jobs yet) or `OTHER` if an unknown error occured

Therefore, the pages a given user has left over to print can be calculated as `pagequota - pagecount`.
In practice, `pagecount` is decreased by `increasecount` at `nextincrease` so that effectively `pagequota - pagecount` is increased by `increasecount`.
