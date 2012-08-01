var github_api_endpoint = "https://api.github.com";
var yahoo_api_endpoint = "http://where.yahooapis.com";
var yahoo_api_key = "dj0yJmk9WFVaNmE5MTF4Y2lyJmQ9WVdrOVpHUXlPVVJ1Tm5FbWNHbzlNVGsyTkRrek16azJNZy0tJnM9Y29uc3VtZXJzZWNyZXQmeD1lMA--"

var values = [];
var github_ajaxes = [];
var yahoo_ajaxes = [];

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
    generate_map({});
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
    $('.map').vectorMap('set', 'values', {});
    var language = $('#selected-language').text();
    var start_page = 1;
    $('.scanned-counter').text("0");
    $('.located-counter').text("0");
    $('.countries-counter').text("0");
    $.each(github_ajaxes, function(i, handle) {
        handle.abort();
    });
    $.each(yahoo_ajaxes, function(i, handle) {
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
                        location_to_country_code(user.location);
                    }
                }
            });
            if (data.data.users.length > 0)
                fetch_users(language, start_page + 1);
        })
    )
}

function location_to_country_code(location) {
    yahoo_ajaxes.push(
        $.getJSON(yahoo_api_endpoint + "/geocode?q="+location+"&flags=J&appid=" + yahoo_api_key, function (data) {
            $('.located-counter').text(parseInt($('.located-counter').text()) + 1);
            if (! $.isEmptyObject(data.ResultSet.Results)) {
                var cc = data.ResultSet.Results[0].countrycode;
                if (values[cc] == undefined) {
                    values[cc] = 1;
                    $('.countries-counter').text(parseInt($('.countries-counter').text()) + 1);
                } else {
                    values[cc] += 1;
                }
                $('.map').vectorMap('set', 'values', values);
            }
        })
    )
}

function generate_map(values){
    $('.map').vectorMap({
        map: 'world_en',
        values: values,
        color: '#F3E4C8',
        scaleColors: ['#F3E4C8', '#A83E2A'],
        normalizeFunction: 'polynomial',
        hoverOpacity: 0.7,
        hoverColor: false,
        backgroundColor: '#1E1D2F'
    });
}

// $('#go-button').click(function () {
//     $('.map-caption').fadeIn();
//     $('.map').vectorMap('set', 'values', {});
//     var language = $('#language-selector').val();
//     $.getJSON(github_api_endpoint +
//     "/legacy/repos/search/"+language+"?language="+language, function(repos) {
//         var ajaxes = [];
//         $.each(repos.repositories, function(i, repo){
//             $.getJSON(github_api_endpoint + "/repos/" + repo.owner + "/" + repo.name + "/contributors", function(contributors) {
//                 $.each(contributors, function(i, contributor){
//                     $.getJSON(github_api_endpoint + "/users/" + contributor.login, function(contributor, status, xhr) {
//                         $('.scanned-counter').text(parseInt($('.scanned-counter').text()) + 1);
//                         $('.current-user').text(contributor.login);
//                         location_to_country_code(contributor.location);
//                     });
//                 });
//             });
//         });
//     });
// });
