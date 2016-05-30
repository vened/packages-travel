var config = {
    "dist": {
        "src": "./dist"
    },
    "nodeApp": {
        "distLayouts": "./dist/node-app/templates/layouts/*.hbs"
    },
    "images": {
        "src": "./spa/img/**",
        "distSrc": "./dist/spa/img"
    },
    "styles": {
        "src": "",
        "distSrc": "./dist/spa/css",
        "distSrcMd5": "./dist/spa/css/*.css"
    },
    "templates": {
        "src": [
            "./spa/templates/**/*.html",
            "./spa/js/**/*.html",
            "./spa/js/widgets/search/templ/*.html"
        ],
        "angularModuleName": "innaApp.templates",
        "distSrc": "./dist/spa/js",
        "distSrcMd5": "./dist/spa/js/*.js"
    },
    "js": {
        "srcApp": [
            "./spa/js/app.js",
            "./spa/js/tracking.js",
            "./spa/js/filters.js",
            "./spa/js/mediator.js",
            "./spa/js/components/**/*.js",
            "./spa/js/regions/**/*.js",
            "./spa/js/pages/**/*.js",
            "./spa/js/controllers/**/*.js",
            "./spa/js/services/**/*.js",
            "./spa/js/directives/**/*.js",
            "./spa/js/helpers/**/*.js",
            "./spa/js/ang.helpers/**/*.js",
            "./spa/js/models/model.js",
            "./spa/js/models/**/*.js",
            "./spa/js/widgets/search/js/directives.js",
            "./spa/js/widgets/search/js/form.js",
            "./spa/js/widgets/search/js/services.js",
            "./spa/js/widgets/search/js/validation.js",
        ],
        "bowerSrcs": [
            "./bower_components/underscore/underscore-min.js",
            "./bower_components/raven-js/dist/raven.min.js",
            "./bower_components/jquery/dist/jquery.min.js",
            "./bower_components/ractive/ractive.min.js",
            "./bower_components/ractive-events-hover/ractive-events-hover.js",
            "./bower_components/angular/angular.min.js",
            "./bower_components/angular-cookies/angular-cookies.min.js",
            "./bower_components/angular-locale-ru/angular-locale_ru.js",
            "./bower_components/angular-sanitize/angular-sanitize.min.js",
            "./bower_components/angular-route/angular-route.min.js",
            "./bower_components/angular-touch/angular-touch.min.js",
            "./bower_components/angular-hotkeys/build/hotkeys.min.js",
            "./bower_components/moment/min/moment.min.js",
            "./bower_components/moment/locale/ru.js",
            "./bower_components/angular-ui-scroll/dist/ui-scroll.min.js",
            "./bower_components/angular-validation/dist/angular-validation.min.js",
            "./bower_components/angular-validation/dist/angular-validation-rule.min.js",
            "./bower_components/angular-ui-select/dist/select.min.js",
            "./bower_components/google-maps-utility-library-v3-infobox/dist/infobox.min.js",
            "./spa/lib/moment-ru.js",
            "./spa/lib/polyfill/**/*.js",
            "./spa/lib/jquery.maskedinput.js",
            "./spa/lib/jquery.ui.datepicker-ru.js",
            "./spa/lib/jquery.scrollTo.min.js",
            "./spa/lib/datepicker/datepicker.js",
            "./spa/lib/jquery-ui/jquery-ui.1.11.2.min.js",
            "./spa/lib/ui-bootstrap-typeahead-custom/typeahead.js",
            "./spa/lib/bootstrap-datepicker/bootstrap-datepicker.js",
            "./spa/lib/bootstrap-datepicker/bootstrap-datepicker.ru.min.js"
        ],
        "distSrc": "./dist/spa/js",
        "distSrcMd5": "./dist/spa/js/*.js"
    },
    "widgets": {
        "src": "./spa/js/widgets"
    },
    "protocol": {
        "http": "http://",
        "https": "https://"
    },
    "partners_version": "/v1",
    "hosts": {
        "b2b": {
            "test": "http://b2b.test.inna.ru",
            "prod": "https://b2b.inna.ru",
            "beta": "http://b2b.beta.inna.ru"
        },
        "b2bSputnik": {
            "test": "http://b2b.sputnik.test.inna.ru",
            "prod": "https://lk.sputnik.travel",
            "beta": "http://b2b.sputnik.beta.inna.ru"
        },
        "b2bPartner": {
            "test": "http://partner.test.inna.ru",
            "prod": "https://partner.inna.ru",
            "beta": "http://partner.beta.inna.ru"
        },
        "api": {
            "test": "http://api.test.inna.ru",
            "prod": "https://api.inna.ru",
            "beta": "http://api.beta.inna.ru"
        },
        "port":{
            "test": 8667,
            "prod": 8666,
            "beta": 8668
        },
        "front": {
            "test": "http://test.inna.ru",
            "prod": "https://inna.ru",
            "beta": "http://beta.inna.ru"
        },
        "static": {
            "test": "http://s.test.inna.ru",
            "prod": "https://s.inna.ru",
            "beta": "https://s.inna.ru"
        },
        "partners": {
            "test": "http://{0}.test.inna.ru",
            "prod": "https://{0}.inna.ru",
            "beta": "http://{0}.beta.inna.ru"
        }
    },
    "tripadvisor": "www.tripadvisor.ru/WidgetEmbed-cdspropertydetail?display=true&partnerId=32CB556934404C699237CD7F267CF5CE&lang=ru&locationId=",
}

module.exports = config;