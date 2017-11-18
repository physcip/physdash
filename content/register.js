function registerTIKVerified() {
	// TODO: Enable new account form
}

/*
 * Register all events when content page gets loaded
 */
document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("content").addEventListener("ContentPageLoaded", function(event) {
		if (event.detail.page == "register") {
			document.getElementsByClassName("tik-form")[0].addEventListener("submit", onTIKSubmit(registerTIKVerified));
		}
	});
});
