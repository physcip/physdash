# physdash to physreg API protocol
[Physreg](https://github.com/physcip/physreg) provides a simple HTTP API responsible new user account creation and password resets. It is based on sending HTTP requests with POST data. Physreg must be hosted on a server that uses TLS/SSL encryption so that data (e.g. passwords) transmitted between physdash and physreg is encrypted using HTTPS.

## Request Commands
Description | URL | Method | Parameter Content Type | Parameters | Error responses
--- | --- | --- | --- | --- | ---
Check if IP of requesting client is allowed to access the physreg API | `register.php?action=ipcheck` | don't care | don't care | don't care | `ipcheck` errors
Check if given TIK credentials are valid | `register.php?action=checkuser` | `POST` | `application/x-www-form-urlencoded` | `rususer` (TIK username), `ruspw` (TIK password) | `ipcheck` errors, common errors, TIK errors
Create new computer lab user (add entry to Samba Active Directory, create home directory) | `register.php?action=createuser` | `POST` | `application/x-www-form-urlencoded` | `rususer` (TIK username), `ruspw` (TIK password), `email` (user's user-entered email address), `password` (preferred computer lab password), `lang` (account locale, e.g. `de` / `en`) | `ipcheck` errors, common errors, TIK errors, physcip errors, `createuser` errors
Change computer lab password in Samba Active Directory given TIK account credentials | `register.php?action=set_password` | `POST` | `application/x-www-form-urlencoded` | `rususer` (TIK username), `ruspw` (TIK password), `password` (preferred new computer lab password) | `ipcheck` errors, common errors, TIK errors, physcip errors, `resetpw` errors

TIK usernames and computer lab usernames are always the same.

## Responses
Responses are always strings containing a JSON-encoded data structure with the following format:
```
{
	error : boolean,
	errormsg : string
}
```

* `error` is `true` if an error occured, otherwise `false`
* `errormsg` only exists, if `error` is `true` and must be a string from one of the lists below

Errors that are the client's fault should be handled in the physdash GUI.

### `ipcheck` errors
`errormsg` | Description | Client's fault
---: | --- | ---
`IP_NOT_ALLOWED` | The IP of the client is not allowed to access the physreg API, since it is not inside the list of valid IPs (that includes computer lab clients and some more IPs) | yes

### Common errors
`errormsg` | Description | Client's fault
---: | --- | ---
`PHYSCIP_INVALID_INPUT` | Not all required parameters have been provided (e.g. missing TIK username, password, ...) | yes

### TIK errors
`errormsg` | Description | Client's fault
---: | --- | ---
`LDAPSPECIAL_AUTH_FAILED` | Could not bind to TIK LDAP server, configured credentials in physreg are invalid or server is down | no
`RUS_USER_INVALID` | Could not find provided TIK username on TIK LDAP server | yes
`RUS_PW_INVALID` | TIK password is wrong | yes

### Physcip errors
`errormsg` | Description | Client's fault
---: | --- | ---
`PHYSCIP_BIND_FAILED` | Could not bind to computer lab's Samba AD, physreg configuration is wrong or server is down | no
`PHYSCIP_SEARCH_FAILED` | Could not search computer lab's Samba AD for username, this shouldn't happen | no

### `createuser` errors
`errormsg` | Description | Client's fault
---: | --- | ---
`USER_NOT_ALLOWED` | Username is not in any group of users allowed to create a computer lab account (not a physics student) | yes
`USER_ALREADY_EXISTS` | A computer lab account with given username already exists | yes
`PHYSCIP_ADD_FAILED` | Could not add new user account to Samba AD, shouldn't happen | no
`PHYSCIP_PRIMARY_FAILED` | Could not make new user account primary member of cipuser group, shouldn't happen | no
`PHYSCIP_DELMEMBER_FAILED` | Could not remove new user account from `Domain Users` group, shouldn't happen | no
`PHYSCIP_CREATEHOME_FAILED` | Could not create new home directory for user, shouldn't happen unless configuration of script to create home directory in physreg is broken | no

### `resetpw` errors
`errormsg` | Description | Client's fault
---: | --- | ---
`PHYSCIP_PW_CHANGE_FAILED` | Could not change user account's password, shouldn't happen | no
