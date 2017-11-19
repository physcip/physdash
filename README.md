# PhysCIP Dashboard
Graphical account management interface for computer lab users. This is a *static* website that may be hosted on any HTTP(S) server. All actions are performed by accessing the respective APIs (physreg API / printer quota API) via HTTPS requests from client-side javascript.

## Functionality
* Create Accounts (Physreg API)
* Reset Password (Physreg API)
* TODO: Query printing quota (printer quota API)
* TODO: FAQ

The communication protocol with [the physreg API](https://github.com/physcip/physreg) is specified in `doc/physreg_protocol.md`.

## Installation / Configuration
This website can be hosted on any HTTP server. For testing, the `http.server` module built into python3 may be used:
```
python -m http.server 8080
```

Make sure `PHYSREG_API_BASE` in `script.js` is configured to point to a working instance of [the physreg API](https://github.com/physcip/physreg):
```JavaScript
var PHYSREG_API_BASE = "https://www.physcip.uni-stuttgart.de/physreg";
```
