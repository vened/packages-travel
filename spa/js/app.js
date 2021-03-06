﻿'use strict';

var app = angular.module('innaApp', [
    'ngRoute',
    'ngTouch',
    'innaApp.Cookie',
    'innaApp.templates',
    'innaApp.filters',
    'innaApp.services',
    'innaApp.directives',
    'innaApp.controllers',
    'innaApp.components',
    'innaApp.Url',
    'innaApp.API',
    'ngSanitize',
    'cfp.hotkeys',
    "ui.bootstrap",
    "widgetsInnaValidation",
    "widgetsInnaWidgetServices",
    'ui.scroll',
    'validation',
    'validation.rule',
    'ui.select',
    "ngCookies",
    'timer'
]);

/* локализация дат moment */
moment.locale('ru');

app.run(['$rootScope', '$location', '$window', '$filter', function ($rootScope, $location, $window, $filter) {
    
    
    // устанавливаем куку от admitad на 100 дней на всяк случай
    var admitad_uid = $location.$$search.admitad_uid;
    if (admitad_uid) {
        var date = new Date;
        date.setDate(date.getDate() + 100);
        document.cookie = "admitad_uid=" + admitad_uid + "; path=/; expires=" + date.toUTCString();
    }
    var b2b_operator = $location.$$search.b2b_operator;
    if (b2b_operator) {
        var date_b2b_operator = new Date;
        date_b2b_operator.setDate(date_b2b_operator.getDate() + 1);
        document.cookie = "b2b_operator=" + b2b_operator + "; path=/; expires=" + date_b2b_operator.toUTCString();
    }
    
    // Ractive.defaults
    Ractive.defaults.data.pluralize = utils.pluralize || null;
    Ractive.defaults.data.moment = moment || null;
    //Ractive.defaults.debug = true;
    Ractive.defaults.data.$filter = $filter;
    Ractive.defaults.data.$rootScope = $rootScope;
    
    //$rootScope.bodyClickListeners = [];
    //
    //$rootScope.addBodyClickListner = function (key, eventDelegate) {
    //    $rootScope.bodyClickListeners.push({key: key, eventDelegate: eventDelegate});
    //};
    //
    //$rootScope.bodyClick = function () {
    //    console.log('root bodyClick');
    //    _.each($rootScope.bodyClickListeners, function (listner) {
    //        listner.eventDelegate();
    //    });
    //};
    
    $rootScope.$on('$routeChangeSuccess', function (event, newUrl, oldUrl) {
        //аналитика
        //console.log('$window._gaq.push $location.path(): ' + $location.path());
        if ($window.ga != null && newUrl.loadedTemplateUrl != undefined) {
            console.log('$routeChangeSuccess write ga - pageview');
            $window.ga('send', 'pageview', $location.path());
        }
        
        
        if (window.partners) {
            //WL показываем фрейм, когда приложение заинитилось
            //window.partners.showFrame();
        }
        
        //console.log('$routeChangeSuccess');
        //скролим наверх
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    });
    
    $rootScope.$on('$locationChangeSuccess', function () {
        //мониторим и проставляем url на странице, где размещен наш фрейм
        if (window.partners) {
            window.partners.saveUrlToParent();
        }
        //console.log('$locationChangeSuccess');
    });
}]);


app.config(['$validationProvider', function ($validationProvider) {
    // Setup `ip` validation
    var expression = {
        passport        : /^.*([a-zA-Z]).*([а-яА-ЯёЁ])(\D)*(\d{6})+$/,
        child_passport  : /^.*([a-zA-Z]{2})(\-).*([а-яА-ЯёЁ]{2})(\D)*(\d{6})+$/,
        customemail     : /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,10}|[0-9]{1,3})(\]?)$/,
        date_format     : function (value, scope, element, attrs, param) {
            var date = moment(value, 'DD.MM.YYYY');
            return date.isValid();
        },
        birthday        : function (value, scope, element, attrs, param) {
            var nowDate = moment();
            var oldDate = moment().subtract('years', 100);
            var date = moment(value, 'DD.MM.YYYY');
            return date.isBefore(nowDate) && date.isAfter(oldDate);
        },
        document_expired: function (value, scope, element, attrs, param) {
            var nowDate = moment();
            var date = moment(value, 'DD.MM.YYYY');
            return date.isAfter(nowDate);
        }
    };
    
    var validMsg = {
        passport        : {
            error  : 'Неверный формат',
            success: 'Ок'
        },
        child_passport  : {
            error  : 'Неверный формат',
            success: 'Ок'
        },
        date_format     : {
            error  : 'Не правильный формат даты',
            success: 'Ок'
        },
        birthday        : {
            error  : 'Не правильная дата рождения',
            success: 'Ок'
        },
        document_expired: {
            error  : 'Не правильный срок действия документа',
            success: 'Ок'
        }
    };
    
    $validationProvider
        .setExpression(expression)
        .setDefaultMsg(validMsg);
}]);


app.config([
    //'$templateCache',
    '$routeProvider',
    '$locationProvider',
    '$httpProvider',
    'innaApp.Urls',
    'AppRouteUrls',
    '$sceProvider',
    function ($routeProvider, $locationProvider, $httpProvider, url, AppRouteUrls, $sceProvider, $filter) {
        
        function dynamic() {
            var partner = window.partners ? window.partners.getPartner() : null;
            if (partner != null && partner.realType == window.partners.WLType.full) {
                if (partner.name == 'biletix') {
                    return {
                        templateUrl: 'pages/partners/biletixPage.html',
                        controller : 'FullWLMainCtrl',
                        resolve    : authController.resolve
                    }
                } else if (partner.name == 'finam') {
                    return {
                        templateUrl: 'pages/partners/finam.html',
                        controller : 'FullWLMainCtrl',
                        resolve    : authController.resolve
                    }
                } else if (partner.name == 'rusline') {
                    return {
                        templateUrl: 'pages/partners/rusline.html',
                        controller : 'FullWLMainCtrl',
                        resolve    : authController.resolve
                    }
                } else if (partner.name == 'komandacard') {
                    return {
                        templateUrl: 'pages/partners/komandacrd.html',
                        controller : 'FullWLMainCtrl',
                        resolve    : authController.resolve
                    }
                } else if (partner.name == 'bpclub') {
                    return {
                        templateUrl: 'pages/partners/bpclub.html',
                        controller : 'FullWLMainCtrl',
                        resolve    : authController.resolve
                    }
                } else if (partner.name == 'touron') {
                    return {
                        templateUrl: 'pages/partners/touron.html',
                        controller : 'FullWLMainCtrl',
                        resolve    : authController.resolve
                    }
                }
                else {
                    return {
                        templateUrl: 'pages/partners/page.html',
                        controller : 'FullWLMainCtrl',
                        resolve    : authController.resolve
                    }
                }
            }
            else if (partner != null && partner.realType == window.partners.WLType.b2b) {
                if (partner.name == 'sputnik') {
                    return {
                        templateUrl: 'pages/page-index/templ/page_sputnik.html',
                        controller : 'DynamicPackageMordaCtrl',
                        resolve    : authController.resolve
                    }
                }
            }
            
            //default page
            return {
                templateUrl: 'pages/page-index/templ/page.html',
                controller : 'DynamicPackageMordaCtrl',
                resolve    : authController.resolve
            }
        }
        
        function avia() {
            var partner = window.partners ? window.partners.getPartner() : null;
            if (partner != null && partner.realType == window.partners.WLType.b2b) {
                if (partner.name == 'sputnik') {
                    return {
                        templateUrl: 'pages/page-tours/templ/page-tours-ctrl_sputnik.html',
                        controller : 'AviaSearchMainCtrl',
                        resolve    : authController.resolve
                    }
                }
            }
            //default page
            return {
                templateUrl: 'pages/page-tours/templ/page-tours-ctrl.html',
                controller : 'AviaSearchMainCtrl',
                resolve    : authController.resolve
            }
        }
        
        //чтобы работал кросдоменный post
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        $httpProvider.interceptors.push(function (guid) {
            return {
                'request' : function (config) {
                    if(config.params) {
                        config.params.clientId = guid.setGuid();
                        console.log('REQUEST-CONFIG', config);
                    }
                    return config;
                }
            }
        });
        $httpProvider.defaults.transformRequest = function (data) {
            return angular.isObject(data) && String(data) !== '[object File]' ? angular.toParam(data) : data;
        };
        
        $sceProvider.enabled(false);
        
        $routeProvider.//Главная
        when(url.URL_ROOT, dynamic()).when(url.URL_PACKAGES_LANDING + ':sectionId-:Adult?-:DepartureId-:ArrivalId?', dynamic()).when(url.URL_PACKAGES_LANDING + ':sectionId-:Adult?-:DepartureId', dynamic()).when(url.URL_PACKAGES_LANDING + ':sectionId-:Adult?', dynamic()).when(url.URL_PACKAGES_LANDING + ':sectionId', dynamic()).when(url.URL_TOURS, {
            templateUrl: 'pages/page-tours/templ/page-tours-ctrl.html',
            controller : 'ToursCtrl',
            resolve    : authController.resolve
        }).when(url.URL_PROGRAMMS + 'category/:id', {
            templateUrl: 'pages/it_category_page.html',
            controller : 'IndividualToursCategoryCtrl',
            resolve    : authController.resolve
        }).when(url.URL_PROGRAMMS, {
            templateUrl: 'pages/it_grid_page.html',
            controller : 'IndividualToursCtrl',
            resolve    : authController.resolve
        }).when(url.URL_ABOUT, {
            templateUrl: 'pages/about_page.html',
            controller : 'AboutCtrl',
            resolve    : authController.resolve
        }).when(url.URL_CONTACTS, {
            templateUrl: 'pages/contacts_page.html',
            controller : 'ContactsCtrl',
            resolve    : authController.resolve
        }).when(url.URL_CERTIFICATES, {
            templateUrl: 'pages/certificates_page.html',
            controller : 'ContactsCtrl',
            resolve    : authController.resolve
        }).when(url.URL_CERTIFICATES_KIT, {
            templateUrl: 'pages/certificates_kit_page.html',
            controller : 'ContactsCtrl',
            resolve    : authController.resolve
        }).when(url.URL_AVIA + ':FromUrl-:ToUrl-:BeginDate-:EndDate?-:AdultCount-:ChildCount-:InfantsCount-:CabinClass-:IsToFlexible-:IsBackFlexible-:PathType', {
            templateUrl: 'pages/avia/search_form.html',
            controller : 'AviaSearchMainCtrl',
            resolve    : authController.resolve
        }).when(url.URL_AVIA + ':FromUrl-:ToUrl', {
            templateUrl: 'pages/page-tours/templ/page-tours-ctrl.html',
            controller : 'AviaSearchMainCtrl',
            resolve    : authController.resolve
        }).when(url.URL_AVIA, avia()).when(url.URL_AVIA_SEARCH + ':FromUrl-:ToUrl-:BeginDate-:EndDate?-:AdultCount-:ChildCount-:InfantsCount-:CabinClass-:IsToFlexible-:IsBackFlexible-:PathType-:VariantId1-:VariantId2?', {
            templateUrl: 'pages/page-avia/templ/search_results.html',
            controller : 'AviaSearchResultsCtrl',
            resolve    : authController.resolve
        }).when(url.URL_AVIA_SEARCH + ':FromUrl-:ToUrl-:BeginDate-:EndDate?-:AdultCount-:ChildCount-:InfantsCount-:CabinClass-:IsToFlexible-:IsBackFlexible-:PathType', {
            templateUrl: 'pages/page-avia/templ/search_results.html',
            controller : 'AviaSearchResultsCtrl',
            resolve    : authController.resolve
        }).when(url.URL_AVIA_RESERVATION + ':FromUrl-:ToUrl-:BeginDate-:EndDate?-:AdultCount-:ChildCount-:InfantsCount-:CabinClass-' +
            ':IsToFlexible-:IsBackFlexible-:PathType-:QueryId-:VariantId1-:VariantId2', {
            templateUrl: 'pages/page-reservations/templ/reserve.html',
            controller : 'AviaReserveTicketsCtrl',
            resolve    : authController.resolve
        }).//when(url.URL_AVIA_BUY + ':FromUrl-:ToUrl-:BeginDate-:EndDate?-:AdultCount-:ChildCount-:InfantsCount-:CabinClass-' +
        //    ':IsToFlexible-:IsBackFlexible-:PathType-:QueryId-:VariantId1-:VariantId2-:OrderNum', {
        //        templateUrl: 'pages/avia/tickets_buy.html',
        //        controller: 'AviaBuyTicketsCtrl',
        //        resolve: authController.resolve
        //    }).
        when(url.URL_BUY + ':OrderNum', {
            templateUrl: 'pages/avia/tickets_buy.html',
            controller : 'AviaBuyTicketsCtrl',
            resolve    : authController.resolve
        })
            .when(url.URL_BUY_SUCCESS + ':OrderNum', {
                templateUrl: 'pages/avia/tickets_buy.html',
                controller : 'AviaBuyTicketsCtrl',
                resolve    : authController.resolve
            }).when(url.URL_BUY_ERROR + ':OrderNum', {
            templateUrl: 'pages/avia/tickets_buy.html',
            controller : 'AviaBuyTicketsCtrl',
            resolve    : authController.resolve
        }).when(url.URL_AVIA_BUY_SUCCESS + ':OrderNum', {
            templateUrl: 'pages/avia/tickets_buy.html',
            controller : 'AviaBuyTicketsCtrl',
            resolve    : authController.resolve
        }).when(url.URL_AVIA_BUY_ERROR + ':OrderNum', {
            templateUrl: 'pages/avia/tickets_buy.html',
            controller : 'AviaBuyTicketsCtrl',
            resolve    : authController.resolve
        }).when(url.URL_AVIA_BUY + ':OrderNum', {
            templateUrl: 'pages/avia/tickets_buy.html',
            controller : 'AviaBuyTicketsCtrl',
            resolve    : authController.resolve
        }).//when(url.URL_DYNAMIC_PACKAGES_BUY_SUCCESS + ':OrderNum?', {
        //    templateUrl: 'pages/page-buy-success/templ/page.html',
        //    controller: 'PageBuySuccess',
        //    resolve: authController.resolve
        //}).
        when(url.URL_DYNAMIC_PACKAGES_BUY_SUCCESS + ':OrderNum', {
            templateUrl: 'pages/avia/tickets_buy.html',
            controller : 'AviaBuyTicketsCtrl',
            resolve    : authController.resolve
        }).when(url.URL_DYNAMIC_PACKAGES_BUY_ERROR + ':OrderNum', {
            templateUrl: 'pages/avia/tickets_buy.html',
            controller : 'AviaBuyTicketsCtrl',
            resolve    : authController.resolve
        }).when(url.URL_DYNAMIC_PACKAGES_BUY + ':OrderNum', {
            templateUrl: 'pages/avia/tickets_buy.html',
            controller : 'AviaBuyTicketsCtrl',
            resolve    : authController.resolve
        }).when(url.URL_DYNAMIC_PACKAGES + ':DepartureId-:ArrivalId', dynamic()).//URL для контекста по ДП
        when(url.URL_DYNAMIC_PACKAGES, dynamic()).when(url.URL_DYNAMIC_PACKAGES_SEARCH + ':DepartureId-:ArrivalId-:StartVoyageDate-:EndVoyageDate-:TicketClass-:Adult-:Children?', {
            templateUrl   : 'pages/page-dynamic/templ/page-dynamic-controller.html',
            controller    : 'PageDynamicPackage',
            resolve       : authController.resolve,
            reloadOnSearch: false
        })
            .when(url.URL_DYNAMIC_HOTEL_DETAILS + ':DepartureId-:ArrivalId-:StartVoyageDate-:EndVoyageDate-:TicketClass-:Adult-:Children?-:HotelId-:TicketId-:TicketBackId-:ProviderId', {
                templateUrl   : 'pages/page-dynamic-details/templ/hotel-details.html',
                controller    : 'PageHotelDetails',
                resolve       : authController.resolve,
                reloadOnSearch: false
            })
            .when(url.URL_DYNAMIC_PACKAGES_RESERVATION + ':DepartureId-:ArrivalId-:StartVoyageDate-:EndVoyageDate-:TicketClass-:Adult-:Children?-:HotelId-:TicketId-:TicketBackId-:ProviderId', {
                templateUrl: 'pages/page-reservations/templ/reserve.html',
                controller : 'DynamicReserveTicketsCtrl',
                resolve    : authController.resolve
            }).when(url.B2B_DISPLAY_ORDER + ':OrderId', {
            templateUrl   : 'pages/page-dynamic-details/templ/hotel-details.html',
            controller    : 'PageHotelDetails',
            resolve       : authController.resolve,
            reloadOnSearch: false
            /*templateUrl: 'pages/page-display-order/templ/display-order.html',
             controller: 'B2B_DisplayOrder'*/
        }).when(url.URL_AUTH_RESTORE, dynamic()).when(url.URL_AUTH_SIGNUP, dynamic()).when(url.URL_HELP, {
            templateUrl   : 'pages/page-help/templ/base.hbs.html',
            controller    : 'HelpPageController',
            resolve       : authController.resolve,
            reloadOnSearch: false
        }).when(url.URL_AGENCY_REG_FORM, {
            templateUrl: 'components/agency-reg-form/templ/index.html',
            controller : 'AgencyRegFormCtrl'
        }).when(url.URL_WHERE_TO_BUY, {
            templateUrl: 'components/where-to-buy/templ/where-to-buy.html',
            controller : 'WhereToBuyCtrl'
        })
            .when(url.URL_TRANSFERS, {
                templateUrl: 'pages/page-transfers/templ/page-transfers.html',
                controller : 'TrasnfersPageCtrl',
                resolve    : authController.resolve
            })
            
            /**
             * begin hotels
             */
            // .when(AppRouteUrls.URL_HOTELS, dynamic)
            .when(AppRouteUrls.URL_HOTELS, {
                templateUrl: 'pages/page-hotels/templ/hotels-root.html',
                controller : 'HotelsRootController',
                //resolve: authController.resolve
            })
            .when(AppRouteUrls.URL_HOTELS + ':StartVoyageDate/:ArrivalId-:NightCount-:Adult-:Children?', {
                templateUrl: 'pages/page-hotels/templ/hotels-index.html',
                controller : 'HotelsIndexController',
                //resolve: authController.resolve
            })
            .when(AppRouteUrls.URL_HOTELS + ':hotelId/:providerId/:StartVoyageDate/:ArrivalId-:NightCount-:Adult-:Children?', {
                templateUrl: 'pages/page-hotels/templ/hotels-show.html',
                controller : 'HotelsShowController',
                //resolve: authController.resolve
            })
            .when('/tours/', {
                templateUrl: 'pages/page-wltours/page-tours.html'
            })
            /**
             * begin bus tours
             */
            .when(AppRouteUrls.URL_BUS, {
                templateUrl: 'pages/page-hotels/templ/bus-root.html',
                controller : 'BusRootController'
            })
            .when(AppRouteUrls.URL_BUS + ':StartVoyageDate/:ArrivalId-:NightCount-:Adult-:Children?', {
                templateUrl: 'pages/page-hotels/templ/bus-index.html',
                controller : 'BusIndexController'
            })
            .when(AppRouteUrls.URL_BUS + ':hotelId/:providerId/:StartVoyageDate/:ArrivalId-:NightCount-:Adult-:Children?', {
                templateUrl: 'pages/page-hotels/templ/hotels-show.html',
                controller : 'HotelsShowController'
            })
            /**
             * end bus tours
             */
            
            /**
             * begin reservation
             */
            .when(AppRouteUrls.URL_RESERVATIONS + ':typeProduct/:hotelId/:providerId/:roomId/:StartVoyageDate/:ArrivalId-:NightCount-:Adult-:Children?', {
                templateUrl: 'pages/page-reservations/templ/reservations.html',
                controller : 'ReservationsController as reservation'
            })
            /**
             * end reservation
             */
            
            
            /**
             * begin new buy page
             */
            .when(AppRouteUrls.URL_PAYMENT + ':OrderNum', {
                templateUrl: 'pages/payment/templ/payment.html',
                controller : 'PaymentController as payment',
                resolve    : authController.resolve
            })
            /**
             * end new buy page
             */
            
            
            /**
             * begin offer link
             * http://localhost:3000/#/select?departureId=departureId&arrivalId=3005&startDate=20.10.2016&NightsCount=13&MinPrice=2342&MinStart=3&hotelName=бла-бла-бла&hotelid=123
             */
            .when('/select?', {
                template  : null,
                controller: 'OfferLinkController'
            })
            /**
             * end offer link
             */
            
            
            .otherwise({
                redirectTo: url.URL_ROOT
            });
        
        /*$locationProvider.html5Mode({
         enabled: true
         //requireBase: false
         });*/
    }
]);

app.config(['$provide', function ($provide) {
    
    
    $provide.decorator('$rootScope', ['$delegate', function ($delegate) {
        $delegate.safeApply = function (fn) {
            var phase = $delegate.$$phase;
            if (phase === "$apply" || phase === "$digest") {
                if (fn && typeof fn === 'function') {
                    fn();
                }
            } else {
                $delegate.$apply(fn);
            }
        };
        return $delegate;
    }
    ]);
    
    $provide.decorator("$exceptionHandler", ["$delegate", function (del) {
        return function (ex, cause) {
            if (Raven) {
                Raven.setExtraContext({context: "__$ExceptionHandler_CONTEXT__"})
                Raven.captureException(new Error(ex), {
                    extra: {
                        dataError: ex,
                        cause    : cause
                    }
                });
            }
            del(ex, cause);
            
        };
    }]);
    
    return $provide;
}
]);

var innaAppCookie = angular.module('innaApp.Cookie', ['ngCookies']);

var innaAppControllers = angular.module('innaApp.controllers', []);
var innaAppConponents = angular.module('innaApp.components', []);

var innaAppTemlates = angular.module('innaApp.templates', []);

var innaAppDirectives = angular.module('innaApp.directives', []);
var innaWidgetValidation = angular.module('widgetsInnaValidation', []);
var innaWidgetServices = angular.module('widgetsInnaWidgetServices', []);

innaAppDirectives.config(['$sceProvider', function ($sceProvider) {
    $sceProvider.enabled(false);
}]);

var innaAppServices = angular.module('innaApp.services', []);

var innaAppFilters = angular.module('innaApp.filters', []);

app.factory('cache', ['$cacheFactory', function ($cacheFactory) {
    var cache = $cacheFactory('myCache');
    return cache;
}]);

(function () {
    
    angular.extend(angular, {
        toParam: toParam
    });
    
    
    /**
     * Преобразует объект, массив или массив объектов в строку,
     * которая соответствует формату передачи данных через url
     * Почти эквивалент [url]http://api.jquery.com/jQuery.param/[/url]
     * Источник [url]http://stackoverflow.com/questions/1714786/querystring-encoding-of-a-javascript-object/1714899#1714899[/url]
     *
     * @param object
     * @param [prefix]
     * @returns {string}
     */
    function toParam(object, prefix) {
        var stack = [];
        var value;
        var key;
        
        for (key in object) {
            value = object[key];
            key = prefix ? prefix + '[' + key + ']' : key;
            
            if (value === null) {
                value = encodeURIComponent(key) + '=';
            } else if (typeof (value) !== 'object') {
                value = encodeURIComponent(key) + '=' + encodeURIComponent(value);
            } else {
                value = toParam(value, key);
            }
            
            stack.push(value);
        }
        
        return stack.join('&');
    }
    
}());


(function ($) {
    $.widget("custom.tooltipX", $.ui.tooltip, {
        options: {
            autoShow: true,
            autoHide: true
        },
        
        _create: function () {
            this._super();
            if (!this.options.autoShow) {
                this._off(this.element, "mouseover focusin");
            }
        },
        
        _open: function (event, target, content) {
            this._superApply(arguments);
            
            if (!this.options.autoHide) {
                this._off(target, "mouseleave focusout");
            }
        }
    });
    
}(jQuery));


//замена директиве link-in-new-window-if-can
//jQuery версия - работает и с angular и с ractive
(function ($) {
    function getHashFromUrl(url) {
        var indexOfHash = url.indexOf("/#");
        var newUrl;
        if (indexOfHash > -1) {
            newUrl = url.substring(indexOfHash, url.length);
        }
        else {
            newUrl = url;
        }
        return newUrl;
    }
    
    function processLinks() {
        //находим все ссылки
        var links = $('a[link-in-new-window-if-can=""]');
        //console.log('links', links.length);
        
        links.each(function (ix, el) {
            processLink($(el));
        });
    }
    
    function processLink(element) {
        //var isBlank = false;
        //удаляем этот аттрибут, чтобы не открывалось новое пустое окно
        if (element.attr('target') == '_blank') {
            element.removeAttr('target');
            //isBlank = true;
        }
        
        var dataEvent = element.attr('data-event');
        var dataLink = element.attr('data-link');
        var link = element.attr('href');
        //console.log('link', link);
        
        //если изменилась ссылка
        if (link != 'javascript:void(0);') {
            //то сохраняем в data-link, а сам href - обнуляем, чтобы не кликалось
            element.attr('href', 'javascript:void(0);');
            element.attr('data-link', link);
        }
        
        //если уже навешивали обработчики
        if (!dataEvent) {
            element.attr('data-event', 1);
            
            element.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                
                var link = element.attr('data-link');
                //на WL фо фрейме ссылки типа
                //http://biletix.ru/packages/#/packages/details/6733-1735-08.06.2015-11.06.2015-0-2--358469-10000088563-10000088632-4?action=buy
                //нужно отрезать все, что до #
                var key = getHashFromUrl(link);
                
                //window.open(link, (isBlank ? '_blank' : ''));//похуй _blank или нет - новое окно
                
                //пробуем открыть новое окно
                var winOpenRes = window.open(link);
                if (winOpenRes) {
                    console.log('window opened:', link);
                }
                else {
                    console.log('window blocked:', link);
                    if (window.partners && window.partners.isFullWL()) {
                        console.log('loading url: ', key);
                        //т.к на партнере ссылка типа http://biletix.ru/packages/#/packages/details/...
                        location.href = key;
                    }
                    else {
                        console.log('loading url: ', link);
                        location.href = link;
                    }
                }
            });
        }
    }
    
    setInterval(processLinks, 300);
}(jQuery));
