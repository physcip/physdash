/*
 * Locale Management
 */
var LOCALEIDS = ["de", "en"];
var LOCALES = {};
var CURRENT_LOCALE = "de";

// Load locales from server
function loadLocales(cb) {
	LOCALEIDS.forEach(function(id) {
		var req = new XMLHttpRequest();
		req.open("GET", "/locale/" + id + ".json" , true);

		req.onload = function() {
			if (req.status == 200) {
				LOCALES[id] = JSON.parse(req.responseText);

				// All locales successfully loaded - callback
				if (Object.keys(LOCALES).length == LOCALEIDS.length)
					cb();
			}
		};

		req.send();
	});
}


// Translate all strings on page
function updateLocale() {
	var elem = document.getElementsByTagName("*");

	for (var i = 0; i < elem.length; ++i) {
		if ("dataset" in elem[i] && "i18n" in elem[i].dataset)
			elem[i].innerHTML = LOCALES[CURRENT_LOCALE][elem[i].dataset.i18n];
	}
}

function onLocaleChange() {
	CURRENT_LOCALE = this.dataset.lang;
	updateLocale();
}

document.addEventListener("DOMContentLoaded", function(event) {
	// Load all locales
	loadLocales(function () {
		updateLocale();
	});

	// Add locale buttons
	LOCALEIDS.forEach(function(id) {
		var flag = document.createElement("img");
		flag.src = "img/locale-" + id + ".svg";
		var li = document.createElement("li");
		li.dataset.lang = id;
		li.classList.add("langbutton");
		li.appendChild(flag);
		li.onclick = onLocaleChange;
		document.getElementById("langflags").appendChild(li);
	});
});

/*
 * Conent Page Management
 */
function loadContentPage(page) {
	var req = new XMLHttpRequest();
	req.open("GET", "/content/" + page + ".html" , true);

	req.onload = function() {
		if (req.status == 200) {
			document.getElementById("content").innerHTML = req.responseText;
			updateLocale();
		}
	};

	req.send();
}

document.addEventListener("DOMContentLoaded", function(event) {
	loadContentPage("home");
});
