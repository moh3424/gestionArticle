function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


var KEY = "Ak1TdiKKxwK8MphYyGcrnX0yXOYCrCW2_3B_VSOSbHzpvWXFkCVHDakNNwiEfTFE";
var map = null;
var from;
var to;
var isLoc = false;
var lat;
var lng;
var directionsDisplay;
//var directionsService = new google.maps.DirectionsService();
var geocoder;
var panorama;
var cityName;
var countryCode;
var geoipRes;
var searched = false
var directionsResponse;
var directionsManager;
var pushpin1;
var started = false;
var marker1;
var marker2;
var minWidth = 1100;
var minHeight = 800;
var topLess = 100;
var directionsService,
    addressError = false,
    startTest = false,
    endTest = false;
$(function () {
    $('#the-switch').click(function () {
        var t = $('#starting-location').val();
        $('#starting-location').val($('#destination').val());
        $('#destination').val(t);
        return false;
    })
    $('a.popup').fancybox({
        type: 'ajax',
        width: 800,
        height: 'auto',
        autoSize: false,
        autoCenter: false,
        padding: 25
    });
    $('a.inline').fancybox({
        width: 800,
        height: 'auto',
        autoSize: false,
        autoCenter: false,
        padding: 25
    });
    $('#directions, #directions-bottom').hide();
    var finalPopup = "#content2";
    $('#btnGetDirection').click(function () {
        isLoc = false;
        if ($('input[name=from]').val() == "" || $('input[name=from]').val() == "Enter Address, business or landmark") from = "";
        else from = $('input[name=from]').val();
        if ($('input[name=to]').val() == "" || $('input[name=to]').val() == "Enter Address, business or landmark") to = "";
        else to = $('input[name=to]').val();
        popCall();
        calculatingRoute(isLoc);
        return false;
    });
    $('#btnGetLocation').click(function () {
        isLoc = true;
        finalPopup = "#content5";
        popCalllocation();
        calculatingRoute(isLoc);
        return false;
    });
    $('.again, #top-back .bar a').click(function () {
        $('body').removeClass('after');
        $.fancybox.close();
        addressError = false;
        startTest = false;
        endTest = false;
        $('#destination').val('').blur();
        $('#starting-location').val('').blur();
        $('#starting').val('').blur();
        initializeMap();
        return false;
    });
    if (typeof ttDetectUtil !== 'undefined') {
        ttDetectUtil.getData('BA5', function (res) {
            if (ttDetectUtil.ttDetectData['hit_count'] > 0) {
                finalPopup = "#content5";
            }
        });
    }
    $('.installnow').click(function () {
        gtag('event', 'click-install');
        setTimeout(function () {
            $.fancybox.close();
            $('body').addClass('after');
            setOfferMap();
        }, 3000);
    });
    $('input[placeholder], textarea[placeholder]').each(function () {
        var iv = $(this).attr('placeholder');
        $(this).attr('placeholder', '');
        $(this).val(iv);
        $(this).focus(function () {
            if (this.value == iv) this.value = '';
        }).blur(function () {
            if (this.value == '') this.value = iv;
        });
    });
    function popCall() {
        var fb = getParameterByName('fb');
        //if contain fb then it form bing and then hide these:
        if (fb) {
            $('.again').hide();
            $('.ab').hide();
        }
        $('#directions, #directions-bottom').hide();
        $('#content1').hide();
        $('#content2').hide();
        $('#content3').hide();
        $('#content4').hide();
        $('#content5').hide();
        $('#content1').show().delay(1500).fadeOut('fast', function () {
            $('#directions, #directions-bottom').show();
            $('#content2').stop().slideDown('normal');
        });
        $.fancybox({
            href: '#map-popup-wrap',
            padding: 0,
            modal: true
        });
        if ($(window).width() < minWidth && $(window).height() < minHeight) {
            $('.fancybox-wrap').css('top', $('.fancybox-wrap').css('top') - topLess);
        }
    }
    function popCalllocation() {
        var fb = getParameterByName('fb');
        //if contain fb then it form bing and then hide these:
        if (fb) {
            $('.again').hide();
            $('.ab').hide();
        }
        $('#directions, #directions-bottom').hide();
        $('#content1').hide();
        $('#content2').hide();
        $('#content3').hide();
        $('#content4').hide();
        $('#content5').hide();
        $('#content1').show().delay(1500).fadeOut('fast', function () {
            $('#content3').stop().slideDown('normal');
        });
        $.fancybox({
            href: '#map-popup-wrap',
            padding: 0,
            modal: true
        });
        if ($(window).width() < minWidth && $(window).height() < minHeight) {
            $('.fancybox-wrap').css('top', $('.fancybox-wrap').css('top') - topLess);
        }
    }
    function popCallforcitymap() {
        var fb = getParameterByName('fb');
        //if contain fb then it form bing and then hide these:
        if (fb) {
            $('.again').hide();
            $('.ab').hide();
        }
        $('#directions, #directions-bottom').hide();
        $('#content1').hide();
        $('#content2').hide();
        $('#content3').hide();
        $('#content4').hide();
        $('#content5').hide();
        $('#content1').show().delay(1500).fadeOut('fast', function () {
            $('#content5').stop().slideDown('normal');
        });
        $.fancybox({
            href: '#map-popup-wrap',
            padding: 0,
            modal: true
        });
        if ($(window).width() < minWidth && $(window).height() < minHeight) {
            $('.fancybox-wrap').css('top', $('.fancybox-wrap').css('top') - topLess);
        }
    }
    $(document).ready(function () {
        var citytype = getParameterByName('citytype');
        //if contain fb then it form bing and then hide these:
        if (citytype) {
            popCallforcitymap();
        }

    });
});
//map-mapbox.js
var searchingComplete = false;
var map;
var finalRoute;
var router;
var printMap;
var defaultLocation;
var clickLatlng = null;
var markerA = null;
var markerB = null;
var startLatlng = null;
var endLatlng = null;
var mapZoom = 12;
L.mapbox.accessToken = MAPBOX_KEY;

function smartMapBoxAutoComplete($element, lat, lng) {
    $element.autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "https://api.mapbox.com/geocoding/v5/mapbox.places/" + request.term + ".json",
                data: {
                    access_token: MAPBOX_KEY,
                    proximity: lng + ',' + lat
                },
                success: function (data) {
                    //console.log(data);
                    if (data.features && data.features.length > 0) {
                        response($.map(data.features, function (item) {
                            return {
                                data: item,
                                label: item.place_name,
                                value: item.place_name
                            }
                        }));
                    }
                }
            });
        },
        minLength: 1
    });
}

function _setMapBoxAutoComplete(lat, lng) {
    smartMapBoxAutoComplete($("#starting-location"), lat, lng);
    smartMapBoxAutoComplete($("#destination"), lat, lng);
    smartMapBoxAutoComplete($("#starting"), lat, lng);
}

function setMapBoxAutoComplete(found) {
    //console.log('setMapBoxAutoComplete');
    $.getJSON("http://ip-api.com/json/", function (data) {
        _setMapBoxAutoComplete(data.lat, data.lon);
    });
}

function createMap(lat, lng, zoom) {
    if (map) map.remove();
    defaultLocation = [lat, lng];
    map = L.mapbox.map('mapviewer').setView([lat, lng], zoom);
    map.on('click', function (e) {
        var iLeft = e.originalEvent.clientX;
        var iTop = e.originalEvent.clientY;
        if (iLeft > $(window).width() - $('#popupdre').outerWidth()) {
            iLeft = $(window).width() - $('#popupdre').outerWidth();
        } else if (iTop > $(window).height() - $('#popupdre').outerHeight()) {
            iTop = $(window).height() - $('#popupdre').outerHeight();
        }
        $('#popupdre').css({
            left: iLeft + 'px',
            top: iTop + 'px'
        }).show();
        clickLatlng = e.latlng;
    });
    var styleLayer = L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v9').addTo(map);
    styleLayer.on('ready', function () {
        styleLayer.options.attribution = "";
    });
    $('#map-wrap-1').height(($(window).height() - $('#top').outerHeight()));
    $('#ms-2').height($('#map-wrap-1').height());
    $('#mapviewer').height($('#map-wrap-1').height());
}

function initializeMap() {
    //console.log('initializeMap');
    $("#mapviewer").html('');
    $.getJSON("http://ip-api.com/json/", function (data) {
        createMap(data.lat, data.lon, 10);
    });
    setMapBoxAutoComplete();
}

function displayRouteInstructions(element) {
    $(element).html('');
    $(element).append(finalRoute.summary)
    for (var i in finalRoute.steps) {
        $(element).append('<p>' + finalRoute.steps[i].maneuver.instruction + '</p>');
    }
}

function setOfferMap() {
    $('#map').show();
    if (!router || !router.directions) return;
    var directionsLayer = L.mapbox.directions.layer(router).addTo(map);
    router.fire('load', router.directions);
    if (finalRoute) router.selectRoute(finalRoute);
    if (router.directions.origin && router.directions.destination) {
        var ori = L.latLng(router.directions.origin.geometry.coordinates[1], router.directions.origin.geometry.coordinates[0]);
        var dest = L.latLng(router.directions.destination.geometry.coordinates[1], router.directions.destination.geometry.coordinates[0]);
        map.fitBounds(L.latLngBounds([ori, dest]));
    }
}

function initPrintMap() {
    if (printMap) printMap.remove();
    printMap = L.mapbox.map('print-map').setView([lat, lng], zoom);
    var styleLayer = L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v9').addTo(map);
    styleLayer.on('ready', function () {
        styleLayer.options.attribution = "";
    });
    if (!router || !router.directions) {
        printMap.setView(defaultLocation, 10);
        return;
    }
    var directionsLayer = L.mapbox.directions.layer(router).addTo(printMap);
    router.fire('load', router.directions);
    if (finalRoute) router.selectRoute(finalRoute);
    if (router.directions.origin && router.directions.destination) {
        var ori = L.latLng(router.directions.origin.geometry.coordinates[1], router.directions.origin.geometry.coordinates[0]);
        var dest = L.latLng(router.directions.destination.geometry.coordinates[1], router.directions.destination.geometry.coordinates[0]);
        printMap.fitBounds(L.latLngBounds([ori, dest]));
    }
}

function calculatingRoute(geoip) {
    geoip = geoip || false;
    //console.log('calculatingRoute');
    $('#directions-holder').html('');
    $('#direction-content').html('');
    $('#directions-error').hide();
    var success = function (response) {
        //$('#success .again').hide();
        directionsError = false;
        searchingComplete = true;
        //$('#content2 h1').html("Directions Found!");
        $('#directions-holder').show();
        $('#directions-error').hide();
        finalRoute = response.routes[0];
        //console.log(response);
        var directionsDisplay = document.getElementById('directions-holder');
        var directionsDisplay2 = document.getElementById('direction-content');
        displayRouteInstructions(directionsDisplay);
        displayRouteInstructions(directionsDisplay2);
        $('.directions-routes').hide();
        if (geoip && false) {
            $('#modal-directions h2').hide();
            $('#modal-directions h2.js-success-preview').show();
            $('#directions-holder').hide();
            $('.map-preview').show();
            //preview_location = response.routes[0].legs[0].end_location;
        }
    };
    var fail1 = function () {
        searchingComplete = true;
        directionsError = true;
        //$('#content2 h1').text('Directions Found!');
        //$('#content2 a.again').hide();
        $('#directions #directions-holder').html('<p class="notfound">Your Directions Could Not Be Found... <a href="#">Search Again</a></p>');
        $('#directions .notfound a').click(function () {
            $.fancybox.close();
            addressError = false;
            startTest = false;
            endTest = false;
            setTimeout(function () {
                $('#content2 a.again').show();
            }, 1000);
            return false;
        });
        addressError = false;
        startTest = false;
        endTest = false;
    };
    //console.log(geoip);
    if (!geoip) {
        var start = document.getElementById("starting-location").value;
        var end = document.getElementById("destination").value;
        start = (start == 'Enter Address, business or landmark') ? '' : start;
        end = (end == 'Enter Address, business or landmark') ? '' : end;
        if (start == '') start = cityName + ', ' + countryCode;
        else if (end == '') end = cityName + ', ' + countryCode;
    } else {
        var start = cityName + ', ' + countryCode;
        var end = document.getElementById("starting").value;
    }
    if (start == '' || end == '') {
        //console.log('fail direct');
        fail1(start, end);
    } else {
        //console.log('routeRequest');
        routeRequest(start, end, success, fail1);
    }
}

function routeRequest(start, end, success, fail) {
    //console.log(start);
    //console.log(end);
    var geocoder = L.mapbox.geocoder('mapbox.places');
    var start_point = false;
    var end_point = false;
    var requestRoute = function (point1, point2) {
        //console.log(point1);
        //console.log(point2);
        router = L.mapbox.directions();
        router.setOrigin(point1);
        router.setDestination(point2);
        router.on('load', function () {
            if (router.directions.routes && router.directions.routes.length > 0) {
                //console.log(router);
                success(router.directions);
            } else {
                fail(start, end);
            }
        });
        router.on('error', function () {
            fail(start, end);
        });
        router.query();
    };
    $('.js-print-from').text(start);
    $('.js-print-to').text(end);
    geocoder.query(start, function (err, result) {
        if (err) {
            start_point = 'err';
            if (end_point !== false && start_point === 'err') fail(start, end);
        } else {
            start_point = result.results.features[0];
            if (start_point !== false && end_point !== false && start_point !== 'err' && end_point !== 'err') requestRoute(start_point, end_point);
        }
    });
    geocoder.query(end, function (err, result) {
        if (err) {
            end_point = 'err';
            if (start_point !== false && end_point === 'err') fail(start, end);
        } else {
            end_point = result.results.features[0];
            if (start_point !== false && end_point !== false && start_point !== 'err' && end_point !== 'err') requestRoute(start_point, end_point);
        }
    });
}
//map click - functions
function getAddress(latlng, target) {
    $.ajax({
        url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + latlng + '.json?access_token=' + MAPBOX_KEY,
        type: 'GET',
        success: function (result) {
            var sAddrName = result.features[0].place_name;
            if (target == 'start') {
                $('#starting-location').val(sAddrName);
            } else if (target == 'end') {
                $('#destination').val(sAddrName);
            }
        }
    })
}

function createMaker(position) {
    if (markerA && position == 'start') {
        map.removeLayer(markerA);
    } else if (markerB && position == 'end') {
        map.removeLayer(markerB);
    }
    var myIcon = null;
    var latlng = [clickLatlng.lat, clickLatlng.lng];
    if (position == 'start') {
        myIcon = L.icon({
            iconUrl: 'http://www.google.com/intl/en_ALL/mapfiles/markerA.png'
        });
        markerA = L.marker(latlng, {
            icon: myIcon
        }).addTo(map);
        var latlng = latlng[1] + ',' + latlng[0];
        getAddress(latlng, 'start');
    } else if (position == 'end') {
        myIcon = L.icon({
            iconUrl: 'http://www.google.com/intl/en_ALL/mapfiles/markerB.png'
        });
        markerB = L.marker(latlng, {
            icon: myIcon
        }).addTo(map);
        var latlng = latlng[1] + ',' + latlng[0];
        getAddress(latlng, 'end');
    }
}


initializeMap();

$('#from').click(function (e) {
    $('#popupdre').hide();
    e.stopPropagation();
    createMaker('start');
});
$('#tohere').click(function (e) {
    $('#popupdre').hide();
    createMaker('end');
    e.stopPropagation();
});
