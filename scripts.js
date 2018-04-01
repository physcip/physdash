/*
 * Locale Management
 */
var LOCALEIDS = ["de", "en"];
var LOCALES = {};
var CURRENT_LOCALE = "de";
var PHYSREG_API_BASE = "https://www.physcip.uni-stuttgart.de/physreg";
var LOCKED_PAGES = [];

// Load locales from server
function loadLocales(cb) {
	LOCALEIDS.forEach(function(id) {
		var req = new XMLHttpRequest();
		req.open("GET", "locale/" + id + ".json", true);

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
			// Use namespace in JSON if data-i18n_namespace is provided
			var namespace = null;
			if ("i18n_namespace" in elem[i].dataset)
				namespace = elem[i].dataset.i18n_namespace;

			// Input elements: Translate button value
			if (elem[i].tagName.toLowerCase() == "input")
				elem[i].value = i18n(namespace, elem[i].dataset.i18n);
			// div, span, li, td, ...: Just translate innerHTML content
			else
				elem[i].innerHTML = i18n(namespace, elem[i].dataset.i18n);
		}
	}
}

function onLocaleChange() {
	CURRENT_LOCALE = this.dataset.lang;
	updateLocale();
}

// Load locales from server, add locale buttons and add content page translation callback
function initLocalization(cb) {
	// Load all locales
	loadLocales(function () {
		updateLocale();
		cb();
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

	// Update i18n strings when content page is loaded
	document.getElementById("content").addEventListener("ContentPageLoaded", function() {
		updateLocale();
	});
}

// Load localized string from locale JSON
// If namespace is `null`, load from root of JSON, otherwise look inside namespace object in JSON
function i18n(namespace, id) {
	if (namespace === null) {
		return LOCALES[CURRENT_LOCALE][id];
	}

	return LOCALES[CURRENT_LOCALE][namespace][id];
}

// Localization functionality may also be used by content pages, e.g. the FAQ
// uses this localization functionality to translate FAQ titles and articles
// If namespace is `null`, add to root of JSON, otherwise add to namespace object in JSON
function addTranslation(namespace, id, strings) {
	for (var lang in strings) {
		if (namespace === null)
			LOCALES[lang][id] = strings[lang];
		else
			LOCALES[lang][namespace][id] = strings[lang];
	}
}

// Getter-function for CURRENT_LOCALE (should not be used except for e.g. date formatting)
function getCurrentLocale() {
	return CURRENT_LOCALE;
}

/*
 * Content Page Management
 */
// Redirect user to http://[HOST:PORT]/path_to_index.html?page=PAGE_NAME
// `page` GET parameter will be evaluated when content is loaded
function switchContentPage(page) {
	var url = new URL(window.location.href);
	url.searchParams.set("page", page);
	window.location.href = url.toString();
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
			switchContentPage(link.dataset.contentpage);
		};
	});
}

// Evaluate `page` GET parameter and load corresponding content page
function loadContentPage() {
	var url = new URL(window.location.href);
	var page = url.searchParams.get("page") || "home";

	// Some pages may be locked in kiosk mode
	if (LOCKED_PAGES.includes(page)) {
		alert("Kiosk Mode - This page is locked\nKiosk-Modus - Seite gesperrt");
		switchContentPage("home");
	}

	var req = new XMLHttpRequest();

	// Workaround: Use random token string to make
	// sure browser doesn't cache content page
	var token = Math.random().toString(36).substring(7);
	req.open("GET", "content/" + page + ".html?token=" + token, true);

	req.onload = function() {
		if (req.status == 200) {
			document.getElementById("content").innerHTML = req.responseText;
			addContentLinks();
			updateContentSelectors(page);

			// Dispatch "ContentPageLoaded" event - handled by content page-specific JS code
			var event = new CustomEvent("ContentPageLoaded", { detail : { page : page } });
			document.getElementById("content").dispatchEvent(event);
		}
	};

	req.send();
}

/*
 * Kiosk Mode
 */
// Physdash may also be used as a kiosk application for user registration.
// We don't want people to access the internet from that kiosk. Since the FAQ
// can contain links to external webpages, just disable FAQ completely.
function checkKioskMode() {
	var url = new URL(window.location.href);
	var kioskmode = url.searchParams.get("kioskmode") || false;

	if (kioskmode)
		LOCKED_PAGES.push("faq");
}

/*
 * Entry point - Load locales and then content page *afterwards*
 */
document.addEventListener("DOMContentLoaded", function() {
	checkKioskMode();
	initLocalization(function() {
		loadContentPage();
	});
});
