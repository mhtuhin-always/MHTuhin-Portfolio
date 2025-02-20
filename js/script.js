!(function (o, c) {
	var n = c.documentElement,
		t = " w-mod-";
	(n.className += t + "js"),
		("ontouchstart" in o ||
			(o.DocumentTouch && c instanceof DocumentTouch)) &&
			(n.className += t + "touch");
})(window, document);

// Open external links in a new tab (alternative)
function ready(callback) {
	if (document.readyState != "loading") callback();
	else if (document.addEventListener)
		document.addEventListener("DOMContentLoaded", callback);
	else
		document.attachEvent("onreadystatechange", function () {
			if (document.readyState == "complete") callback();
		});
}

// Lenis smooth scroll
("use strict");
var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
if (!isSafari && Webflow.env("editor") === undefined) {
	const lenis = new Lenis({
		lerp: 0.1,
		wheelMultiplier: 0.7,
		infinite: false,
		gestureOrientation: "vertical",
		normalizeWheel: false,
		smoothTouch: false,
	});
	function raf(time) {
		lenis.raf(time);
		requestAnimationFrame(raf);
	}

	// Grab all elements that have a "data-target" attribute
	const scrollButtons = document.querySelectorAll("[data-target]");

	// For each element, listen to a "click" event
	scrollButtons.forEach((button) => {
		button.addEventListener("click", (e) => {
			e.preventDefault();

			// get the DOM element by the ID (data-target value)
			var target = button.dataset.target,
				$el = document.getElementById(target.replace("#", ""));

			// Use lenis.scrollTo() to scroll the page to the right element
			lenis.scrollTo($el, {
				offset: 0,
				immediate: false,
				duration: 3,
				easing: (x) =>
					x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, // https://easings.net
			});
		});
	});

	requestAnimationFrame(raf);

	$("[data-lenis-start]").on("click", function () {
		lenis.start();
	});
	$("[data-lenis-stop]").on("click", function () {
		lenis.stop();
	});
	$("[data-lenis-toggle]").on("click", function () {
		$(this).toggleClass("stop-scroll");
		if ($(this).hasClass("stop-scroll")) {
			lenis.stop();
		} else {
			lenis.start();
		}
	});

	function connectToScrollTrigger() {
		lenis.on("scroll", ScrollTrigger.update);
		gsap.ticker.add((time) => {
			lenis.raf(time * 1000);
		});
	}
	// Uncomment this if using GSAP ScrollTrigger
	// connectToScrollTrigger();
}

// Page transition
let transitionTrigger = $(".transition-trigger");
let introDurationMS = 0;
let exitDurationMS = 1200;
let excludedClass = "no-transition";

// On Page Load
if (transitionTrigger.length > 0) {
	transitionTrigger.click();
	$("body").addClass("no-scroll-transition");
	setTimeout(() => {
		$("body").removeClass("no-scroll-transition");
	}, introDurationMS);
}
// On Link Click
$("a").on("click", function (e) {
	if (
		$(this).prop("hostname") == window.location.host &&
		$(this).attr("href").indexOf("#") === -1 &&
		!$(this).hasClass(excludedClass) &&
		$(this).attr("target") !== "_blank" &&
		transitionTrigger.length > 0
	) {
		e.preventDefault();
		$("body").addClass("no-scroll-transition");
		let transitionURL = $(this).attr("href");
		transitionTrigger.click();
		setTimeout(function () {
			window.location = transitionURL;
		}, exitDurationMS);
	}
});
// On Back Button Tap
window.onpageshow = function (event) {
	if (event.persisted) {
		window.location.reload();
	}
};
// Hide Transition on Window Width Resize
setTimeout(() => {
	$(window).on("resize", function () {
		setTimeout(() => {
			$(".transition").css("display", "none");
		}, 50);
	});
}, introDurationMS);

window.addEventListener("DOMContentLoaded", (event) => {
	setTimeout(() => {
		$("[js-line-animation]").each(function (index) {
			gsap.set($(this), {
				autoAlpha: 1,
			});
			let textEl = $(this);
			let textContent = $(this).text();
			let tl;

			function splitText() {
				new SplitType(textEl, {
					types: "lines",
					tagName: "span",
				});
				textEl.find(".line").each(function (index) {
					let lineContent = $(this).html();
					$(this).html("");
					$(this).append(
						`<span class="line-inner" style="display: block;">${lineContent}</span>`
					);
				});
				tl = gsap.timeline({
					scrollTrigger: {
						trigger: textEl,
						start: "top bottom",
						end: "bottom bottom",
						toggleActions: "none play none reset",
					},
				});
				tl.fromTo(
					textEl.find(".line-inner"),
					{
						yPercent: 100,
					},
					{
						yPercent: 0,
						duration: 0.3,
						stagger: {
							amount: 0.5,
							ease: "none",
						},
					}
				);
			}
			splitText();

			let windowWidth = window.innerWidth;
			window.addEventListener("resize", function () {
				if (windowWidth !== window.innerWidth) {
					windowWidth = window.innerWidth;
					tl.kill();
					textEl.text(textContent);
					splitText();
				}
			});
		});
	}, 700);
});

// variables
let customEase =
	"M0,0,C0,0,0.13,0.34,0.238,0.442,0.305,0.506,0.322,0.514,0.396,0.54,0.478,0.568,0.468,0.56,0.522,0.584,0.572,0.606,0.61,0.719,0.714,0.826,0.798,0.912,1,1,1,1";
let counter = {
	value: 40,
};
let loaderDuration = 1.25;

if (window.location.href.indexOf("/made-in-webflow/") > -1) {
	// If not a first time visit in this tab
	if (sessionStorage.getItem("visited") !== null) {
		loaderDuration = 0.5;
		counter = {
			value: 50,
		};
	}
	sessionStorage.setItem("visited", "true");
}

function updateLoaderText() {
	let progress = Math.round(counter.value);
	$(".loader_number").text(progress);
}

function endLoaderAnimation() {
	$(".trigger").click();
	$("body").removeClass("no-scroll");
}

let tl = gsap.timeline({
	onComplete: endLoaderAnimation,
});
tl.to(counter, {
	value: 100,
	onUpdate: updateLoaderText,
	duration: loaderDuration,
	ease: CustomEase.create("custom", customEase),
});
tl.to(
	".loader_progress",
	{
		width: "0%",
		duration: loaderDuration,
		ease: CustomEase.create("custom", customEase),
	},
	0
);

// About section spans
$(".span-wrapper").each(function (index) {
	let relatedEl = $(".span-element").eq(index);
	relatedEl.appendTo($(this));
});

document.addEventListener("DOMContentLoaded", function () {
	var elements = document.querySelectorAll(".work_card-glow-background");

	elements.forEach(function (element) {
		var itemStyle = element.getAttribute("item-style");
		var parentElement = element.closest(".work_collection-list");

		if (parentElement) {
			var numberOfChildren = parentElement.children.length;

			// Set dynamic height based on the number of children
			if (numberOfChildren <= 2) {
				element.style.height = "calc(50% + 16px)";
			} else if (numberOfChildren <= 4) {
				element.style.height = "calc(100% + 16px)";
			} else if (numberOfChildren <= 6) {
				element.style.height = "calc(150% + 32px)"; // Adjusted height
			} else if (numberOfChildren <= 8) {
				element.style.height = "calc(200% + 32px)"; // Adjusted height
			}
		}

		if (itemStyle) {
			var comboClass = "_" + itemStyle;
			element.classList.add(comboClass);
		}
	});
});

// Mobile Work Cards wrapper width for scroll
document.addEventListener("DOMContentLoaded", function () {
	function setCollectionListWidth() {
		var breakpoint = 478;
		var viewportWidth = window.innerWidth;

		if (viewportWidth <= breakpoint) {
			var collectionLists = document.querySelectorAll(
				".work_collection-list"
			);

			collectionLists.forEach(function (list) {
				var numberOfChildren = list.children.length;
				var widthPercentage = numberOfChildren * 100 + "%";

				// Set the calculated width as a percentage directly to the .work_collection-list element
				list.style.width = widthPercentage;
			});
		} else {
			// Reset the width to its original state for larger viewports if needed
			var collectionLists = document.querySelectorAll(
				".work_collection-list"
			);

			collectionLists.forEach(function (list) {
				list.style.width = ""; // Reset to default or any specific width you want for larger viewports
			});
		}
	}

	// Initial setup on page load
	setCollectionListWidth();

	// Update on window resize
	window.addEventListener("resize", setCollectionListWidth);
});

