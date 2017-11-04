/*
 * Locale Management
 */
var LOCALEIDS = ["de", "en"];
var LOCALES = {};
var CURRENT_LOCALE = "de";
var PHYSREG_API_BASE = "http://localhost:8000"; // TODO

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
		if ("dataset" in elem[i] && "i18n" in elem[i].dataset) {
			// Input elements: Translate button value
			if (elem[i].tagName.toLowerCase() == "input")
				elem[i].value = LOCALES[CURRENT_LOCALE][elem[i].dataset.i18n];
			// div, span, li, td, ...: Just translate innerHTML content
			else
				elem[i].innerHTML = LOCALES[CURRENT_LOCALE][elem[i].dataset.i18n];
		}
	}
}

function onLocaleChange() {
	CURRENT_LOCALE = this.dataset.lang;
	updateLocale();
}

document.addEventListener("DOMContentLoaded", function() {
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

	// Update i18n strings when content page ist loaded
	document.getElementById("content").addEventListener("ContentPageLoaded", function() {
		updateLocale();
	});
});

// Load localized string from locale JSON
// If namespace is `null`, load from root of JSON, otherwise look inside namespace object in JSON
function i18n(namespace, id) {
	if (namespace === null) {
		return LOCALES[CURRENT_LOCALE][id];
	}

	return LOCALES[CURRENT_LOCALE][namespace][id];
}

/*
 * Conent Page Management
 */
function loadContentPage(page) {
	var req = new XMLHttpRequest();

	// Workaround: Use random token string to make
	// sure browser doesn't cache content page
	var token = Math.random().toString(36).substring(7);
	req.open("GET", "/content/" + page + ".html?token=" + token, true);

	req.onload = function() {
		if (req.status == 200) {
			document.getElementById("content").innerHTML = req.responseText;
			addContentLinks();
			updateContentSelectors(page);

			var event = new CustomEvent("ContentPageLoaded", { detail : { page : page } });
			document.getElementById("content").dispatchEvent(event);
		}
	};

	req.send();
}

// Underline correct `content-selector` element in header
function updateContentSelectors(page) {
	var selectors = document.getElementsByClassName("content-selector");

	// Fake thick underline with border
	Array.from(selectors).forEach(function(selector) {
		if (selector.dataset.contentpage == page) {
			selector.style["border-bottom"] = "3px solid white";
		} else {
			selector.style["border-bottom"] = "3px solid transparent";
		}
	});
}

// Add .onclick functions to all `content-link` class elements that loads data-contentpage page
function addContentLinks() {
	var links = document.getElementsByClassName("content-link");

	Array.from(links).forEach(function(link) {
		link.onclick = function() {
			loadContentPage(link.dataset.contentpage);
		};
	});
}

document.addEventListener("DOMContentLoaded", function() {
	loadContentPage("home");
});

/*
 * Physreg API access
 */
function physregAction(name, data, cb, cbTimeout) {
	// Encode data object as x-www-form-urlencoded
	var data_encoded = [];
	for (var key in data)
		data_encoded.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));

	// Send POST request to physreg API, call callback with response
	var req = new XMLHttpRequest();
	req.open("POST", PHYSREG_API_BASE + "/register.php?action=" + name, true);
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	req.timeout = 3000;

	req.onload = function() {
		if (req.status == 200)
			cb(JSON.parse(req.responseText));
	};

	req.ontimeout = function() {
		cbTimeout();
	};

	req.onreadystatechange = function() {
		if (req.readyState == 4 && req.status != 200)
			cbTimeout();
	};

	req.send(data_encoded.join("&"));
}

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
