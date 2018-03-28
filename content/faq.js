/*
 * Parse markdown and register all events when content page gets loaded
 */
document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("content").addEventListener("ContentPageLoaded", function(event) {
		if (event.detail.page == "faq") {
			// TODO
		}
	});
});
