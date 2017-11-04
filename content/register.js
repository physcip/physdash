function onTIKSubmit(event) {
	// Don't actually submit the form, handle it in clientside JS instead
	event.preventDefault();

	tikCredentialsElem = document.getElementById("tik-credentials");

	addLoadingAnimation(tikCredentialsElem);

	var username = document.getElementById("register-tik-username").value;
	var password = document.getElementById("register-tik-password").value;

	// TODO: Proper error messages
	physregAction("checkuser", {
		rususer : username,
		ruspw : password
	}, function(res) {
		removeLoadingAnimation(tikCredentialsElem);
		if (res.error == false) {
			alert("success");
			makeSectionComplete(tikCredentialsElem);
		} else if (res.errormsg == "RUS_PW_INVALID") {
			alert("invalid password");
		} else {
			alert("other error: " + res.errormsg);
		}
	}, function() {
		removeLoadingAnimation(tikCredentialsElem);
		alert("timeout");
	});
}

document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("content").addEventListener("ContentPageLoaded", function(event) {
		if (event.detail.page == "register") {
			document.getElementById("register-tik-form").addEventListener("submit", onTIKSubmit);
		}
	});
});
