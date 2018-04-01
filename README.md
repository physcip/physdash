# PhysCIP Dashboard
Graphical account management interface for computer lab users. This is a *static* website that may be hosted on any HTTP(S) server. All actions are performed by accessing the respective APIs (physreg API / printer quota API) via HTTPS requests from client-side javascript.

## Functionality
* Create Accounts (Physreg API)
* Reset Password (Physreg API)
* Query printing quota (printer quota API)
* FAQ

The communication protocol with [the physreg API](https://github.com/physcip/physreg) is specified in `doc/physreg_protocol.md`.
The communication protocol with [the cups_quota API](https://github.com/physcip/cups_quota) is specified in `doc/quota_protocol.md`.
The FAQ ([physfaq](https://github.com/physcip/physfaq)) is included as a git submodule.

## Installation / Configuration
Clone this repository recursively in order to download all included git submodules:
```
git clone --recursive https://github.com/physcip/physdash
```

This website can be hosted on any HTTP server. For testing, the `http.server` module built into python3 may be used:
```
cd physdash
python -m http.server 8080
```

Make sure `PHYSREG_API_BASE` in `script.js` is configured to point to a working instance of [the physreg API](https://github.com/physcip/physreg):
```JavaScript
var PHYSREG_API_BASE = "https://www.physcip.uni-stuttgart.de/physreg";
```

Also make sure `QUOTA_API_BASE` in `content/quota.js` is configured to point to a working instance of [cups_quota](https://github.com/physcip/cups_quota):
```JavaScript
var QUOTA_API_BASE = "https://www.physcip.uni-stuttgart.de/quota";
```
