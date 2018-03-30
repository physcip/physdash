var QUOTA_API_BASE = "https://www.physcip.uni-stuttgart.de/quota";

/*
 * Quota API error handling
 * Get error messages from error strings defined in quota protocol (see `doc/quota_protocol.md`)
 */
function getQuotaErrorDescription(error) {
	if (error == "USER_NOT_FOUND")
		return "quota-user";
	else {
		console.log("Unknown error from cups_quota API: " + error);
		return "quota-other";
	}
}

/*
 * Quota API access
 */
function getQuota(event) {
	// Don't actually submit the form, handle it in clientside JS instead
	event.preventDefault();

	quotaElem = document.getElementsByClassName("quota-element")[0];
	removeSectionError(quotaElem);
	addLoadingAnimation(quotaElem);

	// Get username	and encode as x-www-form-urlencoded
	var username = document.getElementsByClassName("quota-form-username")[0].value;
	var username_encoded = encodeURIComponent(username);
	if (username_encoded.length == 0) {
		makeSectionError(quotaElem, "quota-user");
		return;
	}

	// Send GET request to cups_quota API, call callback with response
	var req = new XMLHttpRequest();
	req.open("GET", QUOTA_API_BASE + "/getquota?username=" + username_encoded, true);
	req.timeout = 3000;

	// Got actual Response from server - handle success or error
	req.onload = function() {
		if (req.status == 200) {
			var response = JSON.parse(req.responseText);
			if (response.error) {
				makeSectionError(quotaElem, getQuotaErrorDescription(response.error));
			} else {
				removeSectionError(quotaElem);
				// TODO: Display in e.g. table
				alert("success: " + req.responseText);
			}
		}
	};

	// Some sort of timeout occured
	req.ontimeout = function() {
		makeSectionError(quotaElem, "quota-timeout");
	};

	req.onreadystatechange = function() {
		if (req.readyState == 4 && req.status != 200)
			makeSectionError(quotaElem, "quota-timeout");
	};

	req.send();
}

/*
 * Register all events when content page gets loaded
 */
document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("content").addEventListener("ContentPageLoaded", function(event) {
		if (event.detail.page == "quota") {
			document.getElementById("quota-form").addEventListener("submit", getQuota);
		}
	});
});
