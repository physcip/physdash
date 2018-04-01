/*
 * Loading animation
 */
function addLoadingAnimation(elem) {
	var loadingDots = document.createElement("div");
	loadingDots.classList.add("form-element-loading");

	// Add three loading dots
	for (var i = 0; i < 3; ++i)
		loadingDots.appendChild(document.createElement("div"));

	elem.appendChild(loadingDots);
}

function removeLoadingAnimation(elem) {
	var loadingDots = elem.getElementsByClassName("form-element-loading");
	if (loadingDots.length > 0)
		elem.removeChild(loadingDots[0]);
}

/*
 * Completed sections
 */
function makeSectionComplete(elem) {
	removeLoadingAnimation(elem);

	var completeTick = document.createElement("div");
	completeTick.classList.add("complete-tick");
	completeTick.innerHTML = "&#10004;";

	var completeSection = document.createElement("div");
	completeSection.classList.add("form-element-complete");
	completeSection.appendChild(completeTick);	

	elem.appendChild(completeSection);
}

/*
 * Action successfull message
 */
function showSuccessMessage() {
	document.getElementById("success-message").style.visibility = "visible";
	document.getElementById("success-dialog-ok").focus();
}

// Success message ok button press callack
document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("success-dialog-ok").addEventListener("click", function() {
		document.getElementById("success-message").style.visibility = "hidden";
		loadContentPage("home");
	});
});

/*
 * Error messages
 */
function makeSectionError(elem, errorid) {
	removeLoadingAnimation(elem);

	var errorMessage = document.createElement("div");
	errorMessage.textContent = i18n("error-messages", errorid);
	errorMessage.dataset.i18n_namespace = "error-messages";
	errorMessage.dataset.i18n = errorid;
	errorMessage.classList.add("form-element-error-message");

	var errorSection = document.createElement("div");
	errorSection.classList.add("form-element-error");

	elem.appendChild(errorMessage);
	elem.appendChild(errorSection);
}

function removeSectionError(elem) {
	var errorSection = elem.getElementsByClassName("form-element-error");
	if (errorSection.length > 0)
		elem.removeChild(errorSection[0]);

	var errorMessage = elem.getElementsByClassName("form-element-error-message");
	if (errorMessage.length > 0)
		elem.removeChild(errorMessage[0]);
}

/*
 * Inactive sections
 */
function makeSectionActive(elem) {
	var notReady = elem.getElementsByClassName("form-element-not-ready");
	if (notReady.length > 0)
		elem.removeChild(notReady[0]);
}

/*
 * TIK credentials section handler
 * Common for account registration and password reset, called from the respective
 * scripts for these content pages. The innter function that gets returned is the
 * callbacked to be executed when the submit button on the TIK credentials form is
 * pressed.
 */
function onTIKSubmit(successCallback) {
	return function(event) {
		// Don't actually submit the form, handle it in clientside JS instead
		event.preventDefault();

		tikCredentialsElem = document.getElementsByClassName("tik-credentials")[0];

		removeSectionError(tikCredentialsElem);
		addLoadingAnimation(tikCredentialsElem);

		var username = document.getElementsByClassName("tik-form-username")[0].value;
		var password = document.getElementsByClassName("tik-form-password")[0].value;

		physregAction("checkuser", {
			rususer : username,
			ruspw : password
		}, function(res) {
			if (res.error == false) {
				makeSectionComplete(tikCredentialsElem);
				successCallback();
			} else {
				makeSectionError(tikCredentialsElem, getPhysregErrorId(res.errormsg));
			}
		}, function() {
			removeLoadingAnimation(tikCredentialsElem);
			makeSectionError(tikCredentialsElem, "timeout");
		});
	}
}

/*
 * Physreg API access
 */
function physregAction(name, data, cb, cbTimeout) {
	// Encode data object as x-www-form-urlencoded
	var data_encoded = [];
	for (var key in data)
		data_encoded.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));

	// Send POST request to physreg API, call callback with response
	var req = new XMLHttpRequest();
	req.open("POST", PHYSREG_API_BASE + "/register.php?action=" + name, true);
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	req.timeout = 3000;

	req.onload = function() {
		if (req.status == 200)
			cb(JSON.parse(req.responseText));
	};

	req.ontimeout = function() {
		cbTimeout();
	};

	req.onreadystatechange = function() {
		if (req.readyState == 4 && req.status != 200)
			cbTimeout();
	};

	req.send(data_encoded.join("&"));
}

/*
 * Physreg API error handling
 * Get error ids from strings defined in physreg protocol (see `doc/physreg_protocol.md`)
 * Handles all errors of type "ipcheck errors", "Common errors", "TIK errors", "Physcip errors",
 * "createuser errors", "resetpw errors" that are the client's fault. Returns generic error message
 * if error string wasn't found.
 * Error ids are just locale ids for the corresponding error message in the `error-messages` namespace
 * of the locale JSON.
 */
function getPhysregErrorId(errormsg) {
	if (errormsg == "IP_NOT_ALLOWED")
		return "ip";
	else if (errormsg == "RUS_PW_INVALID")
		return "password";
	else if (errormsg == "PHYSCIP_INVALID_INPUT")
		return "input";
	else if (errormsg == "RUS_USER_INVALID")
		return "user";
	else if (errormsg == "USER_NOT_ALLOWED")
		return "not-allowed";
	else if (errormsg == "USER_ALREADY_EXISTS")
		return "already-exists";
	else if (errormsg == "PHYSCIP_PW_CHANGE_FAILED")
		return "pwchange-failed";
	else {
		console.log("Unknown errormsg from physreg API: " + errormsg);
		return "other";
	}
}
