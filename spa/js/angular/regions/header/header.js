﻿'use strict';

angular.module('innaApp.directives')
    .directive('regionHeader', ['$templateCache', function ($templateCache) {
        return {
            replace: true,
            template: $templateCache.get('regions/header/templ/header.html'),
            controller: [
                'EventManager',
                '$scope',
                '$location',
                'eventsHelper',
                'urlHelper',
                'innaApp.Urls',
                'innaApp.API.events',
                'aviaHelper',
                function (EventManager, $scope, $location, eventsHelper, urlHelper, appUrls, Events, aviaHelper) {


                    $scope.$on('$routeChangeStart', function (next, current) {
                        $scope.safeApply(function () {
                            $scope.isHeaderVisible = true;
                        });
                    });

                    $scope.isHeaderVisible = true;


                    EventManager.on(Events.HEADER_VISIBLE, function () {
                        $scope.safeApply(function () {
                            $scope.isHeaderVisible = true;
                        });
                    });

                    /*EventManager.on(Events.DYNAMIC_SERP_MAP_DESTROY, function () {
                     $scope.safeApply(function () {
                     $scope.isHeaderVisible = true;
                     });
                     });*/

                    EventManager.on(Events.HEADER_HIDDEN, function () {
                        $scope.safeApply(function () {
                            $scope.isHeaderVisible = false;
                        });
                    });

                    EventManager.on(Events.DYNAMIC_SERP_OPEN_BUNDLE, function () {
                        $scope.safeApply(function () {
                            $scope.isHeaderVisible = true;
                        });
                    });

                    EventManager.on(Events.DYNAMIC_SERP_CLOSE_BUNDLE, function () {
                        $scope.safeApply(function () {
                            $scope.isHeaderVisible = false;
                        });
                    });


                    $scope.isActive = function (route) {
                        var loc = $location.path();
                        var abs = $location.absUrl();

                        if (route == '/') {
                            return ((abs.indexOf('/tours/?') > -1) || loc == route);
                        }
                        else {
                            if (loc.indexOf(route) > -1)
                                return true;
                            else
                                return false;
                        }
                    };

                    $scope.isBodyBg = function () {
                        return $scope.isActive('/avia/reservation/') || $scope.isActive('/packages/reservation/') || $scope.isActive('/buy/');
                    }

                    $scope.urls = appUrls;


                    /**
                     * Определяет какая форма поиска будет показана
                     * @returns {string}
                     */
                    $scope.getHeadForm = function () {
                        var loc = $location.path();
                        var isDynamic = (
                            loc.startsWith(appUrls.URL_DYNAMIC_PACKAGES) && !loc.startsWith(appUrls.URL_DYNAMIC_PACKAGES_RESERVATION) && !loc.startsWith(appUrls.URL_DYNAMIC_PACKAGES_BUY)
                            ) || loc == appUrls.URL_ROOT;

                        var abs = $location.absUrl();
                        if (loc == appUrls.URL_TOURS || abs.indexOf(appUrls.URL_TOURS + '?') > -1) {
                            return 'components/search_form/templ/tours_search_form.html';
                        }
                        else if (isDynamic) {
                            return 'components/search_form/templ/dynamic_search_form.html';
                        }
                        else if (loc.startsWith(appUrls.URL_AVIA) && !loc.startsWith(appUrls.URL_AVIA_RESERVATION) && !loc.startsWith(appUrls.URL_AVIA_BUY)) {
                            return 'components/search_form/templ/avia_search_form.html';
                        }

                        //на бронировании и покупке формы нет
                        else {
                            return '';
                        }
                    };

                    $scope.getTitle = function () {

                        var loc = $location.path();
                        var abs = $location.absUrl();

                        if (loc == '/') {
                            return "Главная";
                        } else if (loc.indexOf(appUrls.URL_DYNAMIC_PACKAGES) > -1) {
                            return "Динамические пакеты";
                        }
                        else if (loc.indexOf(appUrls.URL_AVIA) > -1) {
                            return "Авиабилеты";
                        }
                        else if (loc.indexOf(appUrls.URL_PROGRAMMS) > -1) {
                            return "Программы";
                        }
                        else if (loc.indexOf(appUrls.URL_ABOUT) > -1) {
                            return "О компании";
                        }
                        else if (loc.indexOf(appUrls.URL_CONTACTS) > -1) {
                            return "Контакты";
                        }
                        else {
                            return "Главная";
                        }
                    };

                    setTitle();
                    function setTitle() {
                        $scope.title = "Инна-Тур - " + $scope.getTitle();
                    };

                    $scope.$on('$routeChangeSuccess', function () {
                        setTitle();
                    });

                    $scope.$root.isLoginPopupOpened = false;
                    $scope.headLoginBtnclick = function ($event) {
                        eventsHelper.preventBubbling($event);
                        $scope.$root.isLoginPopupOpened = true;
                    };

                }]
        };
    }]);