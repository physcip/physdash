var PHYSFAQ_BASE = "physfaq";
var FAQARTICLES = {};

function loadFAQArticle(contentElement) {
	var articleid = contentElement.dataset.articleid;
	var articleFiles = FAQARTICLES[articleid].file;
	var article_i18n_id = "_faq_article" + articleid;

	// The following function will be called, when all locales have been loaded
	// by XMLHttpRequests. Add article contents to i18n subsystem and display article.
	var articleContents = {};
	var allLocalesLoaded = function() {
		addTranslation(null, article_i18n_id, articleContents);
		contentElement.dataset.i18n = article_i18n_id;
		contentElement.innerHTML = i18n(null, article_i18n_id);
	}

	// Load articles for all locales (articleFiles is an object containing
	// locale -> file mappings) add add to localization subsystem
	// This also takes care of parsing markdown to HTML ("marked" function)
	Object.keys(articleFiles).forEach(function(locale) {
		var req = new XMLHttpRequest();
		req.open("GET", PHYSFAQ_BASE + "/" + articleFiles[locale], true);

		req.onload = function() {
			if (req.status == 200) {
				var articlePath = articleFiles[locale].substr(0, articleFiles[locale].lastIndexOf("/") + 1);

				articleContents[locale] = marked(req.responseText, {
					baseUrl : PHYSFAQ_BASE + "/" + articlePath
				});

				// All locales successfully loaded - callback
				if (Object.keys(articleFiles).length == Object.keys(articleContents).length)
					allLocalesLoaded();
			}
		}

		req.send();
	});
}

/*
 * Load FAQ titles and add them to list
 * Also takes care of adding FAQ titles to i18n system for localization
 */
function loadFAQList() {
	var req = new XMLHttpRequest();
	req.open("GET", PHYSFAQ_BASE + "/articles.json", true);

	req.onload = function() {
		if (req.status == 200) {
			FAQARTICLES = JSON.parse(req.responseText);

			// Just add FAQ article titles to locales (addTranslation) so that
			// the i18n code can take care of localizing these strings
			for (var i = 0; i < FAQARTICLES.length; ++i) {
				var title_i18n_id = "_faq_title" + i;

				addTranslation(null, title_i18n_id, FAQARTICLES[i].title);

				// Article container
				var faqArticle = document.createElement("div");
				faqArticle.classList.add("faq-article");

				// Article content
				var faqArticleContent = document.createElement("div");
				faqArticleContent.classList.add("faq-article-content");
				faqArticleContent.classList.add("markdown-body");
				faqArticleContent.dataset.articleid = i;
				faqArticleContent.style.display = "none";

				// Article header
				var faqArticleHeader = document.createElement("div");
				faqArticleHeader.classList.add("faq-article-header");
				faqArticleHeader.dataset.i18n = title_i18n_id;
				faqArticleHeader.innerHTML = i18n(null, title_i18n_id);
				faqArticleHeader.dataset.articleid = i;
				faqArticleHeader.onclick = function() {
					// contentElement is faqArticleContent corresponding to currently clicked header
					var contentElement = this.parentElement.getElementsByClassName("faq-article-content")[0];

					if (contentElement.style.display == "none") {
						contentElement.style.display = "block";
						loadFAQArticle(contentElement);
					} else {
						contentElement.style.display = "none";
					}
				}

				faqArticle.appendChild(faqArticleHeader);
				faqArticle.appendChild(faqArticleContent);
				document.getElementById("faq-articles").appendChild(faqArticle);
			}
		}
	};

	req.send();
}

/*
 * Parse markdown and register all events when content page gets loaded
 */
document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("content").addEventListener("ContentPageLoaded", function(event) {
		if (event.detail.page == "faq") {
			loadFAQList();
		}
	});
});
