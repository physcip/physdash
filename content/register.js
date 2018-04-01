function registerTIKVerified() {
	var newAccountForm = document.getElementsByClassName("new-account-data")[0];
	makeSectionActive(newAccountForm);
	var newAccountUsername = document.getElementsByClassName("new-account-username")[0];
	var tikUsername = document.getElementsByClassName("tik-form-username")[0].value;
	newAccountUsername.value = tikUsername.toLowerCase();
	document.getElementsByClassName("new-account-password-1")[0].focus();
}

/*
 * The HTML GUI distinguishes between the email's local part and domain (in case users have
 * troubling finding "@" on the keyboard). If somehow a user still enters "@" inside the
 * local part text box, switch to domain box automatically.
 */
function checkAtSymbolEntered(event) {
	if (event.key == "@") {
		document.getElementsByClassName("new-account-email-domain")[0].value = "";
		document.getElementsByClassName("new-account-email-domain")[0].focus();
		event.preventDefault();
	}
}

/*
 * Handle new account form
 * Password length restriction is enforced client-side. If you are skilled enough to
 * circumvent the password length restriction, you probably know better than to use a
 * bad password.
 */
function onNewAccountSubmit(event) {
	// Don't actually submit the form, handle it in clientside JS instead
	event.preventDefault();

	// Get the two passwords from form and check if they match
	var password1 = document.getElementsByClassName("new-account-password-1")[0].value;
	var password2 = document.getElementsByClassName("new-account-password-2")[0].value;

	newAccountElem = document.getElementsByClassName("new-account-data")[0];
	removeSectionError(newAccountElem);

	if (password1 != password2) {
		makeSectionError(newAccountElem, "passwords-mismatch");
		return;
	}

	if (password1.length < 6) {
		makeSectionError(newAccountElem, "password-length");
		return;
	}

	// Build E-Mail address from local part and domain
	var emailLocalpart = document.getElementsByClassName("new-account-email-localpart")[0].value;
	var emailDomain = document.getElementsByClassName("new-account-email-domain")[0].value;
	var emailAddress = emailLocalpart + "@" + emailDomain;

	// Get account language
	var locale = document.getElementsByClassName("new-account-localebutton-selected")[0].dataset.locale;

	// Get TIK credentials from TIK form and send command to physreg API
	addLoadingAnimation(newAccountElem);

	var tikUsername = document.getElementsByClassName("tik-form-username")[0].value;
	var tikPassword = document.getElementsByClassName("tik-form-password")[0].value;

	physregAction("createuser", {
		rususer : tikUsername,
		ruspw : tikPassword,
		email : emailAddress,
		password : password1,
		lang : locale
	}, function(res) {
		removeLoadingAnimation(newAccountElem);
		if (res.error == false) {
			makeSectionComplete(newAccountElem);
			showSuccessMessage();
		} else {
			makeSectionError(newAccountElem, getPhysregErrorId(res.errormsg));
		}
	}, function() {
		removeLoadingAnimation(newAccountElem);
		makeSectionError(newAccountElem, "timeout");
	});
}

/*
 * Handle locale button selection: Select clicked locale button only
 */
function onLocaleButtonPress(event) {
	Array.from(document.getElementsByClassName("new-account-localebutton")).forEach(function(btn) {
		btn.classList.remove("new-account-localebutton-selected");
	});
	this.classList.add("new-account-localebutton-selected");
}

/*
 * Register all events when content page gets loaded
 */
document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("content").addEventListener("ContentPageLoaded", function(event) {
		if (event.detail.page == "register") {
			document.getElementsByClassName("tik-form")[0].addEventListener("submit", onTIKSubmit(registerTIKVerified));
			document.getElementsByClassName("new-account-form")[0].addEventListener("submit", onNewAccountSubmit);
			document.getElementsByClassName("new-account-email-localpart")[0].addEventListener("keypress", checkAtSymbolEntered);
			Array.from(document.getElementsByClassName("new-account-localebutton")).forEach(function(btn) {
				btn.addEventListener("click", onLocaleButtonPress);
			});
		}
	});
});
