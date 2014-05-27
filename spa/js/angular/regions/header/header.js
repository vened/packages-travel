﻿'use strict';

angular.module('innaApp.directives')
    .directive('regionHeader', [function () {
        return {
            replace: true,
            templateUrl: '/spa/js/angular/regions/header/templ/header.html',
            controller: [
                '$scope',
                '$location',
                'eventsHelper',
                'urlHelper',
                'innaApp.Urls',
                'aviaHelper',
                function ($scope,$location, eventsHelper, urlHelper, appUrls, aviaHelper) {

                    $scope.$on('$routeChangeStart', function (next, current) {
                        $scope.$emit('header:visible');
                    });

                    $scope.isHeaderVisible = true;

                    $scope.$on('header:hidden', function () {
                        console.log('hidden');
                        $scope.isHeaderVisible = false;
                    });

                    $scope.$on('header:visible', function () {
                        $scope.isHeaderVisible = true;
                    });


                    $scope.isActive = function (route) {
                        var loc = $location.path();
                        var abs = $location.absUrl();
                        //console.log('loc: ' + loc + ' route: ' + route);
                        if (route == '/') {
                            return ((abs.indexOf('/tours/?') > -1) || loc == route);
                        }
                        else {
                            if (loc.indexOf(route) > -1)
                                return true;
                            else
                                return false;
                        }
                    }


                    $scope.getHeadForm = function () {
                        var loc = $location.path();
                        //log('$scope.getHeadForm, loc:' + loc);
                        var abs = $location.absUrl();
                        if (loc == '/' || abs.indexOf('/tours/?') > -1) {
                            return urlHelper.addPathAndVersion('/spa/templates/nav_forms/tours_search_form.html');
                        } else if (loc.startsWith(appUrls.URL_DYNAMIC_PACKAGES) && !loc.startsWith(appUrls.URL_DYNAMIC_PACKAGES_RESERVATION)) {
                            return urlHelper.addPathAndVersion('/spa/templates/nav_forms/dynamic_search_form.html');
                        }
                        else if (loc.startsWith(appUrls.URL_AVIA) && !loc.startsWith(appUrls.URL_AVIA_RESERVATION) && !loc.startsWith(appUrls.URL_AVIA_BUY)) {
                            //на бронировании и покупке формы нет
                            return urlHelper.addPathAndVersion('/spa/templates/nav_forms/avia_search_form.html');
                        }
                        else {
                            return urlHelper.addPathAndVersion('/spa/templates/nav_forms/empty.html');
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

                }],
            link: function ($scope, $element, attrs) {
                console.log($element[0]);
            }
        };
    }]);