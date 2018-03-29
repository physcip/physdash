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
function makeSectionError(elem, message) {
	var errorMessage = document.createElement("div");
	errorMessage.textContent = message;
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
			removeLoadingAnimation(tikCredentialsElem);
			if (res.error == false) {
				makeSectionComplete(tikCredentialsElem);
				successCallback();
			} else {
				makeSectionError(tikCredentialsElem, getPhysregErrorDescription(res.errormsg));
			}
		}, function() {
			removeLoadingAnimation(tikCredentialsElem);
			makeSectionError(tikCredentialsElem, i18n("error-messages", "timeout"));
		});
	}
}
