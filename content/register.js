function onTIKSubmit() {
	var username = document.getElementById("register-tik-username").value;
	var password = document.getElementById("register-tik-password").value;

	physregAction("checkuser", {
		rususer : username,
		ruspw : password
	}, function(res) {
		// TODO
		if (res.error == false) {
			alert("success");
		} else if (res.errormsg == "RUS_PW_INVALID") {
			alert("invalid password");
		} else {
			alert("other error: " + res.errormsg);
		}
	});
}

document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("content").addEventListener("ContentPageLoaded", function(event) {
		if (event.detail.page == "register") {
			document.getElementById("register-tik-submit").addEventListener("click", onTIKSubmit);
		}
	});
});
