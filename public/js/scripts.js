(function ($) {
  $(document).ready(function () {
    "use strict";

    // TAB
    $(".tab-nav li").on('click', function (e) {
      $(".tab-item").hide();
      $(".tab-nav li").removeClass('active');
      $(this).addClass("active");
      var selected_tab = $(this).find("a").attr("href");
      $(selected_tab).stop().show();
      return false;
    });


    // SEARCH 
    $('.navbar .search-button, .sticky-navbar .search-button').on('click', function (e) {
      $(".search-box").addClass('active');
      $("body").addClass("overflow");
    });
    $('.search-box .close-button').on('click', function (e) {
      $(".search-box").removeClass('active');
      $("body").removeClass("overflow");
    });


    // HAMBURGER 
    $('.navbar .hamburger-menu').on('click', function (e) {
      $(".side-widget").addClass('active');
      $("body").addClass("overflow");
    });
    $('.side-widget .close-button').on('click', function (e) {
      $(".side-widget").removeClass('active');
      $("body").removeClass("overflow");
    });


    /* MENU TOGGLE */
    $('.side-widget .inner .site-menu ul li i').on('click', function (e) {
      $(this).parent().children('.side-widget .inner .site-menu ul li ul').toggle();
      return true;
    });


  });
  // END DOCUMENT READY	  

  // STICKY NAVBAR
  var didScroll;
  var lastScrollTop = 0;
  var delta = 5;
  var navbarHeight = $('.sticky-navbar').outerHeight();

  $(window).scroll(function (event) {
    didScroll = true;
    if ($(this).scrollTop() > 400) {
      $('.sticky-navbar').css("margin-top", "0");
    } else {
      $('.sticky-navbar').css("margin-top", "-100%");
    }
  });

  setInterval(function () {
    if (didScroll) {
      hasScrolled();
      didScroll = false;
    }
  }, 250);

  function hasScrolled() {
    var st = $(this).scrollTop();

    // Make sure they scroll more than delta
    if (Math.abs(lastScrollTop - st) <= delta)
      return;

    // If they scrolled down and are past the navbar, add class .nav-up.
    // This is necessary so you never see what is "behind" the navbar.
    if (st > lastScrollTop && st > navbarHeight) {
      // Scroll Down
      $('.sticky-navbar').removeClass('nav-down').addClass('nav-up');
    } else {
      // Scroll Up
      if (st + $(window).height() < $(document).height()) {
        $('.sticky-navbar').removeClass('nav-up').addClass('nav-down');
      }
    }

    lastScrollTop = st;
  }


  // SVG PROGRESS 
  jQuery(window).on('load', function () {

    var progressPath = document.querySelector('.scrollup path');
    var pathLength = progressPath.getTotalLength();

    progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
    progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
    progressPath.style.strokeDashoffset = pathLength;
    progressPath.getBoundingClientRect();
    progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';

    var updateProgress = function () {
      var scroll = jQuery(window).scrollTop();
      var height = jQuery(document).height() - jQuery(window).height();
      var progress = pathLength - (scroll * pathLength / height);
      progressPath.style.strokeDashoffset = progress;
    };

    updateProgress();

    jQuery(window).scroll(updateProgress);

  });


  // GO TO TOP
  $(window).scroll(function () {
    if ($(this).scrollTop() > 400) {
      $('.scrollup').fadeIn();
    } else {
      $('.scrollup').fadeOut();
    }
  });

  $('.scrollup').on('click', function (e) {
    $("html, body").animate({
      scrollTop: 0
    }, 600);
    return false;
  });


  // DATA BACKGROUND IMAGE
  var pageSection = $("*");
  pageSection.each(function (indx) {
    if ($(this).attr("data-background")) {
      $(this).css("background", "url(" + $(this).data("background") + ")");
    }
  });


  // DATA BACKGROUND COLOR
  var pageSection = $("*");
  pageSection.each(function (indx) {
    if ($(this).attr("data-background")) {
      $(this).css("background", $(this).data("background"));
    }
  });


  // MAIN SLIDER
  var swiper = new Swiper('.main-slider', {
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    grabCursor: true,
    watchSlidesProgress: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><circle r="13" cy="15" cx="15"></circle></svg></span>';
      },
    },
  });


  // NEWS SLIDER
  var mainslider = new Swiper('.news-slider-top', {
    slidesPerView: "1",

    spaceBetween: 10,
    autoplay: {
      delay: 9500,
      disableOnInteraction: false,
    },

    effect: 'fade',
    loop: true,
    loopedSlides: 5, //looped slides should be the same
    thumbs: {
      swiper: thumbslider
    }
  });


  // NEWS SLIDER
  var thumbslider = new Swiper('.news-slider-thumbs', {
    spaceBetween: 10,
    slidesPerView: 3,

    loop: true,
    loopedSlides: 5, //looped slides should be the same
    watchSlidesVisibility: true,
    watchSlidesProgress: true,
    touchRatio: 0.2,
    slideToClickedSlide: true,
    breakpoints: {
      1024: {
        slidesPerView: 3
      },
      768: {
        slidesPerView: 2
      },
      640: {
        slidesPerView: 1
      },
      320: {
        slidesPerView: 1
      }
    }
  });

  if ($(".news-slider-top")[0]) {
    mainslider.controller.control = thumbslider;
    thumbslider.controller.control = mainslider;
  } else {

  }


  // HIGHLIGT SLIDER
  var highlightslider = new Swiper('.highlight-slider-top', {
    slidesPerView: "1",

    spaceBetween: 10,
    autoplay: {
      delay: 9500,
      disableOnInteraction: false,
    },

    effect: 'fade',
    loop: true,
    loopedSlides: 5, //looped slides should be the same
    thumbs: {
      swiper: highlightthumbs
    }
  });


  // HIGHLIGT SLIDER
  var highlightthumbs = new Swiper('.highlight-slider-thumbs', {
    spaceBetween: 30,
    slidesPerView: 4,

    loop: true,
    loopedSlides: 5, //looped slides should be the same
    watchSlidesVisibility: true,
    watchSlidesProgress: true,
    touchRatio: 0.2,
    slideToClickedSlide: true,
    breakpoints: {
      1024: {
        slidesPerView: 3
      },
      768: {
        slidesPerView: 2
      },
      640: {
        slidesPerView: 1
      },
      320: {
        slidesPerView: 1
      }
    }
  });

  if ($(".highlight-slider-top")[0]) {
    highlightslider.controller.control = highlightthumbs;
    highlightthumbs.controller.control = highlightslider;
  } else {

  }


})(jQuery);
