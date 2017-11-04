function onTIKSubmit(event) {
	// Don't actually submit the form, handle it in clientside JS instead
	event.preventDefault();

	tikCredentialsElem = document.getElementById("tik-credentials");

	removeSectionError(tikCredentialsElem);
	addLoadingAnimation(tikCredentialsElem);

	var username = document.getElementById("register-tik-username").value;
	var password = document.getElementById("register-tik-password").value;

	physregAction("checkuser", {
		rususer : username,
		ruspw : password
	}, function(res) {
		// TODO: Specify communication protocol, handle all possible error messages
		removeLoadingAnimation(tikCredentialsElem);
		if (res.error == false)
			makeSectionComplete(tikCredentialsElem);
		else if (res.errormsg == "RUS_PW_INVALID")
			makeSectionError(tikCredentialsElem, i18n("tik-error-messages", "password"));
		else if (res.errormsg == "PHYSCIP_INVALID_INPUT")
			makeSectionError(tikCredentialsElem, i18n("tik-error-messages", "input"));
		else if (res.errormsg == "RUS_USER_INVALID")
			makeSectionError(tikCredentialsElem, i18n("tik-error-messages", "user"));
		else
			makeSectionError(tikCredentialsElem, i18n("tik-error-messages", "other") + res.errormsg);
	}, function() {
		removeLoadingAnimation(tikCredentialsElem);
		makeSectionError(tikCredentialsElem, i18n("tik-error-messages", "timeout"));
	});
}

document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("content").addEventListener("ContentPageLoaded", function(event) {
		if (event.detail.page == "register") {
			document.getElementById("register-tik-form").addEventListener("submit", onTIKSubmit);
		}
	});
});
