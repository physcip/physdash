/*
 * Callback: This function gets called when the entered TIK credentials
 * have been successfully verified. Enables "enter new password" form.
 */
function resetpwTIKVerified() {
	var newPasswordForm = document.getElementsByClassName("new-password")[0];
	makeSectionActive(newPasswordForm);
	document.getElementsByClassName("new-password-1")[0].focus();
}

/*
 * Handle new password form
 * Password length restriction is enforced client-side. If you are skilled enough to
 * circumvent the password length restriction, you probably know better than to use a
 * bad password.
 */
function onNewPasswordSubmit(event) {
	// Don't actually submit the form, handle it in clientside JS instead
	event.preventDefault();

	// Get the two new passwords from form and check if they match
	var password1 = document.getElementsByClassName("new-password-1")[0].value;
	var password2 = document.getElementsByClassName("new-password-2")[0].value;

	newPasswordElem = document.getElementsByClassName("new-password")[0];
	removeSectionError(newPasswordElem);

	if (password1 != password2) {
		makeSectionError(newPasswordElem, i18n("error-messages", "passwords-mismatch"));
		return;
	}

	if (password1.length < 6) {
		makeSectionError(newPasswordElem, i18n("error-messages", "password-length"));
		return;
	}

	// Get TIK credentials from TIK form and send command to physreg API
	addLoadingAnimation(newPasswordElem);

	var tikUsername = document.getElementsByClassName("tik-form-username")[0].value;
	var tikPassword = document.getElementsByClassName("tik-form-password")[0].value;

	physregAction("set_password", {
		rususer : tikUsername,
		ruspw : tikPassword,
		password : password1
	}, function(res) {
		removeLoadingAnimation(newPasswordElem);
		if (res.error == false) {
			makeSectionComplete(newPasswordElem);
			showSuccessMessage();
		} else {
			makeSectionError(newPasswordElem, getPhysregErrorDescription(res.errormsg));
		}
	}, function() {
		removeLoadingAnimation(newPasswordElem);
		makeSectionError(newPasswordElem, i18n("error-messages", "timeout"));
	});
}

/*
 * Register all events when content page gets loaded
 */
document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("content").addEventListener("ContentPageLoaded", function(event) {
		if (event.detail.page == "resetpw") {
			document.getElementsByClassName("tik-form")[0].addEventListener("submit", onTIKSubmit(resetpwTIKVerified));
			document.getElementsByClassName("new-password-form")[0].addEventListener("submit", onNewPasswordSubmit);
		}
	});
});
