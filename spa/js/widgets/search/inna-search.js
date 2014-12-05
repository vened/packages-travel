(function (d) {

    var host = 'http://inna.ru';
    var widget = d.querySelector(".b-inna-search-widget");

    var sources = {
        'css': host + '/spa/js/widgets/search/build/inna-search-widget.css',
        'jquery': host + '/bower_components/jquery/dist/jquery.min.js',
        'angular': host + '/bower_components/angular/angular.min.js',
        'app': host + '/spa/js/widgets/search/build/inna-search-widget.js'
    };


    function insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    function insertCss() {
        var link = d.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = sources.css;
        insertAfter(link, widget);
    };

    var jquery = d.createElement("script");

    function insertJquery() {
        jquery.charset = "utf-8";
        jquery.src = sources.jquery;
        insertAfter(jquery, widget);
    };

    var angular = d.createElement("script");

    function insertAngular() {
        angular.charset = "utf-8";
        angular.src = sources.angular;
        insertAfter(angular, widget);
    };

    function insertApp() {
        var app = d.createElement("script");
        app.charset = "utf-8";
        app.src = sources.app;
        insertAfter(app, widget);
    };

    insertJquery();

    jquery.onload = function () {
        insertAngular();
    };

    angular.onload = function () {
        insertApp();
    };

    insertCss();

}(document));