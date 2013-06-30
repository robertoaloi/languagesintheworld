var github_api_endpoint = "https://api.github.com";
var geocoding_api_endpoint = "http://nominatim.openstreetmap.org";

var cache = {};
var values = [];
var countries = [];
var devs = {};
var fullnames = {};
var github_ajaxes = [];
var geocoding_ajaxes = [];

// TODO: Dropdown with GitHub languages
// TODO: Caching
// TODO: Praise GitHub for a proper User Search API
// TODO: Most influential users
// TODO: Pagination doesn't work for GitHub API
// TODO: Top 10 Countries
// TODO: Style
// TODO: Save this map / Share / Send via Email
// TODO: Remove duplicated users
// TODO: Dynamic language
// TODO: Use appid
// TODO: Adjust a/an in selected language
// TODO: Add a pigeon
// TODO: Support all GitHub languages
// TODO: How it works section
// TODO: Scrolldown nicely

$(document).ready(function(){
    generate_map();
});

$('.language-selector').click(function() {
    var article = ($(this).attr('data-article') == undefined) ? "a" : $(this).attr('data-article');
    var language = $(this).attr('id');
    $('#selected-article').text(article);
    $('#selected-language').text(language);
    $('.language-selector').parent().attr('class', '');
    $(this).parent().attr('class', 'current-menu-item');
});

$('#go-button').click(function () {
    $('.map-caption').fadeIn();
    $('.stats-block').fadeIn();
    $('.map').vectorMap('set', 'values', {});
    values = [];
    countries = [];
    devs = {};
    var language = $('#selected-language').text();
    var start_page = 1;
    $('.scanned-counter').text("0");
    $('.located-counter').text("0");
    $('.countries-counter').text("0");
    $.each(github_ajaxes, function(i, handle) {
        handle.abort();
    });
    $.each(geocoding_ajaxes, function(i, handle) {
        handle.abort();
    });
    fetch_users(language, start_page);
});

function fetch_users(language, start_page) {
    github_ajaxes.push(
        $.getJSON(github_api_endpoint + "/legacy/user/search/language:" + language + "?start_page=" + start_page + "&callback=?", function(data) {
            $.each(data.data.users, function(i, user){
                if (user.language == language) {
                    $('.scanned-counter').text(parseInt($('.scanned-counter').text()) + 1);
                    if (user.location != "" && user.location != undefined && user.location != null) {
                        if (cache[user.location] != undefined) {
                            handle_entry(cache[user.location][0], cache[user.location][1], user.username, user.followers, user.fullname);
                        } else {
                            location_to_country_code(user.location, user.username, user.followers, user.fullname);
                        }
                    }
                }
            });
            if (data.data.users.length > 0)
                fetch_users(language, start_page + 1);
        })
    )
}

function handle_entry(c, cc, username, followers, fullname) {
    if (values[cc] == undefined) {
        values[cc] = 1;
        countries[cc] = c;
        $('.countries-counter').text(parseInt($('.countries-counter').text()) + 1);
    } else {
        values[cc] += 1;
    }
    if (devs[cc] == undefined)
        devs[cc] = new Array();
    devs[cc][username] = followers;
    if (fullname != null)
        fullnames[username] = fullname;
    else
        fullnames[username] = username;
    $('.map').vectorMap('set', 'values', values);
    var top_countries = rank(values, 10);
    $('.countries-league').empty();
    $.each(top_countries, function(i,e){
        $('.countries-league').append(
            '<li>' + countries[e[0]] + ' (' + values[e[0]] + ')</li>'
        );
    });
}

function location_to_country_code(location, username, followers, fullname) {
    geocoding_ajaxes.push(
        $.getJSON(geocoding_api_endpoint + "/search?q="+location+"&format=json&addressdetails=1", function (data) {
            $('.located-counter').text(parseInt($('.located-counter').text()) + 1);
            if (! $.isEmptyObject(data)) {
                var c = data[0].address.country;
                var cc = data[0].address.country_code.toUpperCase();
                cache[location] = [c, cc];
                handle_entry(c, cc, username, followers, fullname);
            }
        })
    )
}

function generate_map(){
    $('.map').vectorMap({
        map: 'world_en',
        values: values,
        color: '#F3E4C8',
        scaleColors: ['#F3E4C8', '#A83E2A'],
        normalizeFunction: 'polynomial',
        hoverOpacity: 0.7,
        hoverColor: false,
        backgroundColor: '#1E1D2F',
        onLabelShow: function(event, label, code) {
            if (values[code] == undefined) {
                label.html(label.html() + ' (0)')
            } else {
                label.html(label.html() + ' (' + values[code] + ')')
            }
        },
        onRegionClick: function(event, code){
            $('.devs-league').empty();
            if (devs[code] != undefined) {
                var top_devs = rank(devs[code], 10);
                $.each(top_devs, function(i,e){
                    $('<a/>', {
                        href: 'http://github.com/' + e[0],
                        target: '_blank',
                        text: fullnames[e[0]]
                    }).wrap('<li/>').parent().appendTo('.devs-league');
                });
            }
        }
    });
}

function rank(obj, max) {
    var tuples = [];
    for (var key in obj) {
        tuples.push([key, obj[key]]);
    }
    tuples.sort(function(a, b) {
        return a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0
    });
    return tuples.slice(0, max);
}

