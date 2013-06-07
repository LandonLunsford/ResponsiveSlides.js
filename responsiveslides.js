/*! ResponsiveSlides.js v1.54
 * http://responsiveslides.com
 * http://viljamis.com
 *
 * Copyright (c) 2011-2012 @viljamis
 * Available under the MIT license
 */
/*jslint browser: true, sloppy: true, vars: true, plusplus: true, indent: 2 */
(function ($, window, i) {
	$.fn.responsiveSlides = function (options) {

		// Default settings
		var settings = $.extend({
				auto: true, // Boolean: Animate automatically, true or false
				speed: 500, // Integer: Speed of the transition, in milliseconds
				timeout: 4000, // Integer: Time between slide transitions, in milliseconds
				pager: false, // Boolean: Show pager, true or false
				nav: false, // Boolean: Show navigation, true or false
				random: false, // Boolean: Randomize the order of the slides, true or false
				pause: false, // Boolean: Pause on hover, true or false
				pauseControls: true, // Boolean: Pause when hovering controls, true or false
				prevText: 'Previous', // String: Text for the "previous" button
				nextText: 'Next', // String: Text for the "next" button
				maxwidth: '', // Integer: Max-width of the slideshow, in pixels
				navContainer: '', // Selector: Where auto generated controls should be appended to, default is after the <ul>
				manualControls: '', // Selector: Declare custom pager navigation
				namespace: 'rslides', // String: change the default namespace used
				before: $.noop, // Function: called before rotation transition -- function($nextSlide, $currentSlide, settings)
				after: $.noop // Function: called after rotation transition -- function($nextSlide, $currentSlide, settings)
			}, options);

		return this.each(function () {

			// Index for namespacing
			i++;

			var $this = $(this)

				// Local variables
				,vendor
				,selectTab
				,startCycle
				,restartCycle
				,rotate
				,$tabs

				// Helpers
				,index = 0
				,$slide = $this.children()
				,length = $slide.length // size is deprecated
				
				,fadeTime = parseFloat(settings.speed)
				//,waitTime = parseFloat(settings.timeout) //I wish to update this on a per-slide basis
				,getTimeout = function(){ return parseFloat(settings.timeout); }
				,maxw = parseFloat(settings.maxwidth)

				// Namespacing
				,namespace = settings.namespace
				,namespaceIdx = namespace + i

				// Classes
				,navClass = namespace + '_nav ' + namespaceIdx + '_nav'
				,activeClass = namespace + '_here'
				,visibleClass = namespaceIdx + '_on'
				,slideClassPrefix = namespaceIdx + '_s'

				// Pager
				,$pager = $('<ul class="' + namespace + '_tabs ' + namespaceIdx + '_tabs" />')

				// Styles for visible and hidden slides
				,visible = {
					'float': 'left'
					,'position': 'relative'
					,'opacity': 1
					,'zIndex': 2
				}
				,hidden = {
					'float': 'none'
					,'position': 'absolute'
					,'opacity': 0
					,'zIndex': 1
				}

				// Detect transition support
				,supportsTransitions = (function () {
					var docBody = document.body || document.documentElement;
					var styles = docBody.style;
					var prop = 'transition';
					if (typeof styles[prop] === 'string') {
						return true;
					}
					// Tests for vendor specific prop
					vendor = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];
					prop = prop.charAt(0).toUpperCase() + prop.substr(1);
					var i;
					for (i = 0; i < vendor.length; i++) {
						if (typeof styles[vendor[i] + prop] === 'string') {
							return true;
						}
					}
					return false;
				})()

				// Fading animation
				slideTo = function (nextIndex) {
					settings.before(nextIndex, index, settings);
					// If CSS3 transitions are supported
					if (supportsTransitions) {
						$slide
							.removeClass(visibleClass)
							.css(hidden)
							.eq(nextIndex)
							.addClass(visibleClass)
							.css(visible);
						
						setTimeout(function () {
							settings.after(nextIndex, index, settings);
						}, fadeTime);
						index = nextIndex;
						restartCycle();
					} else {// If not, use jQuery fallback
						$slide
							.stop()
							.fadeOut(fadeTime, function () {
								$(this)
									.removeClass(visibleClass)
									.css(hidden)
									.css('opacity', 1);
							})
							.eq(nextIndex)
							.fadeIn(fadeTime, function () {
								$(this)
									.addClass(visibleClass)
									.css(visible);
								settings.after(nextIndex, index, settings);
								index = nextIndex;
								restartCycle();
							});
					}
				};

			// Random order
			if (settings.random) {
				$slide.sort(function () { return 0.5 - Math.random(); });
				$this.empty().append($slide);
			}

			// Add ID's to each slide
			$slide.each(function (i) {
				this.id = slideClassPrefix + i;
			});

			// Add max-width and classes
			$this.addClass(namespace + ' ' + namespaceIdx);
			if (options && options.maxwidth) {
				$this.css('max-width', maxw);
			}

			// Hide all slides, then show first one
			$slide
				.hide()
				.css(hidden)
				.eq(0)
				.addClass(visibleClass)
				.css(visible)
				.show();

			// CSS transitions
			if (supportsTransitions) {
				$slide
					.show()
					.css({
						// -ms prefix isn't needed as IE10 uses prefix free version
						'-webkit-transition': 'opacity ' + fadeTime + 'ms ease-in-out'
						,'-moz-transition': 'opacity ' + fadeTime + 'ms ease-in-out'
						,'-o-transition': 'opacity ' + fadeTime + 'ms ease-in-out'
						,'transition': 'opacity ' + fadeTime + 'ms ease-in-out'
					});
			}

			// Only run if there's more than one slide
			if ($slide.length > 1) {

				// Make sure the timeout is at least 100ms longer than the fade
				if (getTimeout() < fadeTime + 100) {
					return;
				}

				// Pager
				if (settings.pager && !settings.manualControls) {
					
					$pager.append($.map($slide, function(item, index) {
						var number = index + 1;
						return '<li><a href="javascript:void(0)" class="' + slideClassPrefix + number + '">' + number + '</a></li>';
					}));

					// Inject pager
					if (options.navContainer) {
						$(settings.navContainer).append($pager);
					} else {
						$this.after($pager);
					}
				}

				// Manual pager controls
				if (settings.manualControls) {
					$pager = $(settings.manualControls);
					$pager.addClass(namespace + '_tabs ' + namespaceIdx + '_tabs');
				}

				// Add pager slide class prefixes
				if (settings.pager || settings.manualControls) {
					$pager.find('li').each(function (i) {
						$(this).addClass(slideClassPrefix + (i + 1));
					});
				}

				// If we have a pager, we need to set up the selectTab function
				if (settings.pager || settings.manualControls) {
					$tabs = $pager.find('a');

					// Select pager item
					selectTab = function (idx) {
						$tabs
							.closest('li')
							.removeClass(activeClass)
							.eq(idx)
							.addClass(activeClass);
					};
				}

				// Auto cycle
				if (settings.auto) {

					startCycle = function () {

						rotate = setInterval(function () {

							// Clear the event queue
							$slide.stop(true, true);

							var nextIndex = index + 1 < length ? index + 1 : 0;

							// Remove active state and set new if pager is set
							if (settings.pager || settings.manualControls) {
								selectTab(nextIndex);
							}

							slideTo(nextIndex);
						}, getTimeout());
					};

					// Init cycle
					startCycle();
				}

				// Restarting cycle
				restartCycle = function () {
					if (settings.auto) {
						// Stop
						clearInterval(rotate);
						// Restart
						startCycle();
					}
				};

				// Pause on hover
				if (settings.pause) {
					$this.hover(function () {
						clearInterval(rotate);
					}, function () {
						restartCycle();
					});
				}

				// Pager click event handler
				if (settings.pager || settings.manualControls) {
					$tabs.bind('click', function (event) {
							event.preventDefault();

							if (!settings.pauseControls) {
								restartCycle();
							}

							// Get index of clicked tab
							var idx = $tabs.index(this);

							// Break if element is already active or currently animated
							if (index === idx || $('.' + visibleClass).queue('fx').length) {
								return;
							}

							// Remove active state from old tab and set new one
							selectTab(idx);

							// Do the animation
							slideTo(idx);
						})
						.eq(0)
						.closest('li')
						.addClass(activeClass);

					// Pause when hovering pager
					if (settings.pauseControls) {
						$tabs.hover(function () {
							clearInterval(rotate);
						}, function () {
							restartCycle();
						});
					}
				}

				// Navigation
				if (settings.nav) {
					var navMarkup = '<a href="javascript:void(0)" class="' + navClass + ' prev">' + settings.prevText + '</a><a href="javascript:void(0)" class="' + navClass + ' next">' + settings.nextText + '</a>';

					// Inject navigation
					if (options.navContainer) {
						$(settings.navContainer).append(navMarkup);
					} else {
						$this.after(navMarkup);
					}

					var $trigger = $('.' + namespaceIdx + '_nav'),
						$prev = $trigger.filter('.prev');

					// Click event handler
					$trigger.bind('click', function (event) {
						event.preventDefault();

						var $visibleClass = $('.' + visibleClass);

						// Prevent clicking if currently animated
						if ($visibleClass.queue('fx').length) {
							return;
						}

						// Determine where to slide
						var idx = $slide.index($visibleClass),
							prevIdx = idx - 1,
							nextIdx = idx + 1 < length ? index + 1 : 0;

						// Go to slide
						slideTo($(this)[0] === $prev[0] ? prevIdx : nextIdx);
						if (settings.pager || settings.manualControls) {
							selectTab($(this)[0] === $prev[0] ? prevIdx : nextIdx);
						}

						if (!settings.pauseControls) {
							restartCycle();
						}
					});

					// Pause when hovering navigation
					if (settings.pauseControls) {
						$trigger.hover(function () {
							clearInterval(rotate);
						}, function () {
							restartCycle();
						});
					}
				}

			}

			// Max-width fallback
			if (typeof document.body.style.maxWidth === 'undefined' && options.maxwidth) {
				var widthSupport = function () {
					$this.css('width', '100%');
					if ($this.width() > maxw) {
						$this.css('width', maxw);
					}
				};

				// Init fallback
				widthSupport();
				$(window).bind('resize', function () {
					widthSupport();
				});
			}

		});

	};
})(jQuery, this, 0);
