/*
 * Register all events when content page gets loaded
 */
document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("content").addEventListener("ContentPageLoaded", function(event) {
		if (event.detail.page == "resetpw") {
			document.getElementsByClassName("tik-form")[0].addEventListener("submit", onTIKSubmit);
		}
	});
});
