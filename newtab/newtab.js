$(document).ready(function() {
  navigationLoader();
  contentLoader();
});

function navigationLoader() {
  var index = 0;
  $("#navigation").append("<ul class='nav-container'></ul>");
  Object.keys(feeds).forEach(function (key) {
    var link = feeds[key];
    $(".nav-container").append("<li class='nav-item nav-item-" + index + "' data-link='" + key + "' ><span>" + key + "</span></li>");
    index++;
  });
  var navItems =  document.getElementsByClassName("nav-item");
  for(var i = 0; i < navItems.length; i++)
  {
      navItems.item(i).addEventListener("click", function(e){
          var feed = this.getAttribute("data-link");
          contentLoader(feed, false);
          _gaq.push(['_trackEvent', 'Category', 'clicked', feed]);
      });
  }
}

// Makes the AJAX call to load the feed
function contentLoader(feed = "Όλα", init = true) {
  var items = 0;
  feedLink= feeds[feed];
  $.ajax(feedLink, {
    accepts: {
      xml: "application/rss+xml"
    },
    dataType: "xml",
    beforeSend: function() {
      $("#newsContent").css("opacity", "0");
      if (!init){
        $("#newsContent").empty();
        $("#loader").addClass('open');
      }
    },
    success: function(data) {
      var navItems =  document.getElementsByClassName("nav-item");
      for(var i = 0; i < navItems.length; i++)
      {
          var currentItem = navItems.item(i);
          if( currentItem.getAttribute("data-link") == feed){
            $(currentItem).addClass('active');
          }else{
            $(currentItem).removeClass('active');
          }
      }
      $("#newsContent").append("<div class='owl-carousel'></div>");
      $(data).find("item").each(function() { // or "item" or whatever suits your feed
        var el = $(this);
        newsItem(el, items, feed);
        items++;
      });

    }
  }).done(function() {
    $(".owl-carousel").owlCarousel({
      items: 1,
      margin: 10,
      dots: true,
      autoplay:true,
      autoplayTimeout:8000,
      autoplayHoverPause:true
    });
    $("#newsContent").css("opacity", "1");
    $("#loader").removeClass('open');
  });
}

// Creates a news block
function newsItem(el, index, feed) {
  var title = el.find("title").text();
  var content = el.find("description").text();
  var link = el.find("link").text();
  var date = formatDate(el.find("pubDate").text());
  var category = el.find("category").text();

  $(".owl-carousel").append("<div class='news-item item-" + index + "'><div class='news-image-wrapper'></div><div class='news-content-wrapper'></div></div>");
  $(".item-" + index + " .news-content-wrapper").append("<div class='news-meta'><span class='news-date'>" + date + "</span> - <span class='news-category' data-cat='" + category + "'>" + category + "</span></div>");
  $(".item-" + index + " .news-content-wrapper").append("<a class='news-title' href='" + link + "'><h2>" + title + "</h2></a>");

  $(".item-" + index + " .news-content-wrapper").append("<p class='news-content'>" + content + "</p>");
  fetchImage(link, index);

  $(".item-" + index + " .news-title").on("click", function(e){
      _gaq.push(['_trackEvent', 'Article', 'clicked', link]);
  });
}

// Formats the raw date from the XML
function formatDate(rawDate) {

  var date = new Date(rawDate);

  var days = ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετέρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
  var months = ["Ιανουαρίου", "Φεβρουαρίου", "Μαρτίου", "Απριλίου", "Μαίου", "Ιουνίου", "Ιουλίου", "Αυγούστου", "Σεπτεμβρίου", "Οκτωβρίου", "Νοεμβρίου", "Δεκεμβρίου"];

  var date = days[date.getDay()] + " " + date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear() + ", " + date.getHours() + ":" + date.getMinutes();
  return date;
}

// Fetches the image from the website
function fetchImage(articleLink, index) {
  $.ajax({
    method: 'get',
    url: articleLink,
    dataType: "html",
    success: function(data) {
      var html = $.parseHTML(data);
      var imageLink = $(html).filter("link[rel=image_src]").attr("href");
      $(".item-" + index + " .news-image-wrapper ").empty();
      imageLink = imageLink ? imageLink : 'icon-128.png';
      $(".item-" + index + " .news-image-wrapper").append("<img src='" + imageLink + "'/>");
    }
  });
}

var feeds = {
  "Όλα": "http://rss.in.gr/feed/news",
  "Ελλάδα": "http://rss.in.gr/feed/news/greece",
  "Οικονομία": "http://rss.in.gr/feed/news/economy",
  "Κόσμος": "http://rss.in.gr/feed/news/world",
  "Επιστήμη": "http://rss.in.gr/feed/news/science",
  "Πολιτισμός": "http://rss.in.gr/feed/news/culture"
}

// Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-106649138-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
