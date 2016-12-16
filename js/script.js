"use strict";
var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var letterIndex = 0;

//Location class
var Location = function(title, lng, lat, id) {
    var self = this;
    this.title = title;
    this.lat = lat;
    this.lng = lng;
    //this.label = label;
    this.id = id;

    this.getContent = function() {
        var content = [];
        var locationUrl = 'https://api.foursquare.com/v2/venues/' + self.id + '/tips?sort=recent&limit=10&client_id=311T4HGEDANHVRXXJOMIILBXRZVBV1MAYTSWYQKTQXQJ4TFL&client_secret=XLNSJPQOTQWGTDRDGJAO3DPEMPBZ21FBC4POK1TARKLVXXFN&v=20161206';

        $.getJSON(locationUrl,
            function(data) {
                $.each(data.response.tips.items, function(i, tips){
                    content.push('<li>' + tips.text + '</li>');
                });

            }).done(function(){
                self.content = '<h2>' + self.title + '</h2>' + '<h3>10 Most Recent Comments</h3>' + '<ol class="tips">' + content.join('') + '</ol>';
            }).fail(function(jqXHR, textStatus, errorThrown) {
                self.content = '<h2>' + self.title + '</h2>' + '<h3>10 Most Recent Comments</h3>' + '<h4>Cannot load location\'s comments.</h4>';
                console.log('getJSON failed ' + textStatus);
            });
        }();

    this.infowindow = new google.maps.InfoWindow();
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(self.lng, self.lat),
        map: map,
        animation: google.maps.Animation.DROP,
        title: self.title,
        //label: labels[labelIndex++ % labels.length],
        icon: "http://maps.google.com/mapfiles/marker" + letters[letterIndex++ % letters.length] + ".png"
    });
    console.log(self.title);

    this.toggleBounce = function() {
        if (self.marker.getAnimation() !== null) {
          self.marker.setAnimation(null);
        } else {
          self.marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function(){ self.marker.setAnimation(null);}, 1500);
        }
      };

    this.openInfowindow = function() {
        for (var i=0; i < locationsModel.locations.length; i++) {
            locationsModel.locations[i].infowindow.close();
        }
        map.panTo(self.marker.getPosition());
        self.infowindow.setContent(self.content);
        self.infowindow.open(map,self.marker);
    };

    //this.addListener = google.maps.event.addListener(self.marker, 'click', (this.openInfowindow));
    this.addListener = google.maps.event.addListener(self.marker, 'click', function(){
        self.openInfowindow();
        self.toggleBounce();
    });
};

var locationsModel = {
    locations:[
        new Location('josey-baker-bread', 37.7752439, -122.4419307, '4a80b3fbf964a520f4f51fe3'),
        new Location('tartine-bakery', 37.7614, -122.4241, '42814b00f964a52002221fe3'),
        new Location('schuberts-bakery', 37.772422, -122.444510, '4ad6765ef964a5204c0721e3'),
        new Location('miette-patisserie', 37.7960, -122.3940, '49d3cecef964a520195c1fe3'),
        new Location('arsicault-bakery', 37.7834, -122.4593, '55203ab9498eb807ad0e6da5'),
        new Location('le-merais-bakery',37.778918, -122.415494,'51d3859e498e7eba6ae6ba4d'),
        new Location('golden-gate-bakery', 37.7964182, -122.4068852, '4a2ac0fdf964a52049961fe3')
    ],
    query: ko.observable(''),
};

locationsModel.search = ko.dependentObservable(function() {
    var self = this;
    var search = this.query().toLowerCase();
    return ko.utils.arrayFilter(self.locations, function(location) {
        return location.title.toLowerCase().indexOf(search) >= 0;
    });
}, locationsModel);

//Hide and Show entire Nav/Search Bar on click
    // Hide/Show Bound to the arrow button
    //Nav is repsonsive to smaller screen sizes
var isNavVisible = true;
function noNav() {
    $("#search-area").animate({
                height: 0,
            }, 500);
            setTimeout(function() {
                $("#location-list").hide();
            }, 500);    
            $("#arrow").attr("src", "img/down_arrow.gif");
            isNavVisible = false;
}
function yesNav() {
    $("#search-area").show();
            var scrollerHeight = $("#location-list").height() + 55;
            if($(window).height() < 600) {
                $("#search-area").animate({
                    height: scrollerHeight - 100,
                }, 500, function() {
                    $(this).css('height','auto').css("max-height", 439);
                });  
            } else {
            $("#search-area").animate({
                height: scrollerHeight,
            }, 500, function() {
                $(this).css('height','auto').css("max-height", 549);
            });
            }
            $("#arrow").attr("src", "img/up_arrow.gif");
            isNavVisible = true;
}

function hideNav() {
    if(isNavVisible === true) {
            noNav();
    } else {
            yesNav();
    }
}
$("#arrow").click(hideNav);

//Hide Nav if screen width is resized to < 850 or height < 595
//Show Nav if screen is resized to >= 850 or height is >= 595
    //Function is run when window is resized
$(window).resize(function() {
    var windowWidth = $(window).width();
    if ($(window).width() < 850 && isNavVisible === true) {
            noNav();
        } else if($(window).height() < 595 && isNavVisible === true) {
            noNav();
        }
    if ($(window).width() >= 850 && isNavVisible === false) {
            if($(window).height() > 595) {
                yesNav();
            }
        } else if($(window).height() >= 595 && isNavVisible === false) {
            if($(window).width() > 850) {
                yesNav();
            }
        }
});

ko.applyBindings(locationsModel);
