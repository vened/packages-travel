﻿'use strict';

/* Controllers */

innaAppControllers.
    controller('RootCtrl', [
        'EventManager',
        '$log',
        '$scope',
        '$location',
        'dataService',
        'AuthDataProvider',
        'eventsHelper',
        'urlHelper',
        'innaApp.Urls',
        'innaAppApiEvents',
        'aviaHelper',
        '$timeout',
        function (EventManager, $log, $scope, $location, dataService, AuthDataProvider, eventsHelper, urlHelper, appUrls, Events, aviaHelper, $timeout) {

            //js загрузился - показываем все спрятанные элементы
            setTimeout(function () {
                $('.hide-while-loading').removeClass('hide-while-loading');
            }, 0);

            //определяем что iOS
            $scope.iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

            /*
                Title
             */

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

            $scope.getPartnersTitle = function () {

                var loc = $location.path();
                var abs = $location.absUrl();

                if (loc == '/') {
                    return "Перелет + Отель";
                } else if (loc.indexOf(appUrls.URL_DYNAMIC_PACKAGES) > -1) {
                    return "Перелет + Отель";
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
                    return "Перелет + Отель";
                }
            };

            setTitle();

            function setTitle() {
                var partner = window.partners ? window.partners.getPartner() : null;
                // if (partner && partner.realType == window.partners.WLType.b2b){
                //     $scope.title = partner.title + " - " + $scope.getPartnersTitle();
                // }
                if (partner && partner.name){
                    $scope.title = partner.name + " - " + $scope.getPartnersTitle();
                } else {
                    $scope.title = "ИННА ТУР - " + $scope.getTitle();
                }
            }


            $scope.$on('$routeChangeSuccess', function () {
                setTitle();
            });

            /*
             Title
             */


            $scope.$on('$routeChangeStart', function (next, current) {
                EventManager.fire(Events.AJAX__RESET);
            });


            $scope.baloon = aviaHelper.baloon;


            $scope.isActive = function (route) {
                var loc = $location.path();
                var abs = $location.absUrl();

                if (route == '/') {
                    return ((abs.indexOf('/tours/?') > -1) || loc == route);
                } else {
                    if (loc.indexOf(route) > -1)
                        return true;
                    else
                        return false;
                }
            };


            // $scope.isBodyBg = function () {
            //     return $scope.isActive('/avia/reservation/') || $scope.isActive('/packages/reservation/') || $scope.isActive('/reservations/') || $scope.isActive('/buy/');
            // };

            $scope.isTransferBg = function () {
                return $scope.isActive(appUrls.URL_TRANSFERS);
            };

            /**
             * Анимация формы поиска при скролле
             */
            $scope.FormExpand = false;
            $scope.isEnableSearchForm = false;
            $scope.StaticPage = false;
            // $scope.isVisibleNotifNewDesign = false;
            
            $scope.$on('$routeChangeStart', function (next, current) {
               if ($location.$$path.indexOf('/') == 0) {
                   $('.header-nav').css("display", "flex");
               }
                if ($location.$$search.map === 'show') {
                    $scope.bannerGrey = true;
                }else $scope.bannerGrey = false;
                if ($location.$$path.indexOf("/packages/search") > -1 || $location.$$path.indexOf("/packages/details") > -1 || $location.$$path.indexOf("/packages/reservation") > -1
                    || $location.$$path.indexOf("/payment") > -1 || $location.$$path.indexOf("/display-order") > -1 || $location.$$path.indexOf("/individualtours/category") > -1
                    || $location.$$path.indexOf("/registration/") > -1
                )  {

                    $scope.SearchFormExpandPadding = {'display': 'none'};
                }
                if ($location.$$path.indexOf("/display-order") > -1) {
                    $('.header-nav').css("display", "flex");
                    $(".offer-text, .slogan-container").css("display", "flex");
                }
               if ($location.$$path.indexOf("hotels") > -1 && $location.$$path.length > 8)  {
                   $('.header-nav').css("display", "none");
                    $(".offer-text, .slogan-container").css("display", "none");
                    $(".header-menu").css("display", "flex").css("height", "100%");
                   $(document).ready(function(){
                       $('.header-nav').css("display", "none");
                       $(".offer-text, .slogan-container").css("display", "none");
                       $(".header-menu").css("display", "flex").css("height", "100%");
                   });
               }else if ($location.$$path.indexOf("/avia/search") > -1 || $location.$$path.indexOf("/avia/reservation") > -1) {
                   $('.header-nav').css("display", "none");
                   $(".offer-text, .slogan-container").css("display", "none");
                   $(".header-menu").css("height", "100%");
                   $(document).ready(function(){
                       $('.header-nav').css("display", "none");
                       $(".offer-text, .slogan-container").css("display", "none");
                       $(".header-menu").css("display", "flex").css("height", "100%");
                   });
                }
               else {
                   $(".offer-text, .slogan-container").css("display", "flex");
                   // $(".header-menu").css("height", "85vh");
               }
                switch ($location.$$path) {
                    case '/':
                    case '/avia/':
                    case '/tours/':
                    case '/packages/':
                    case '/hotels/':
                    case '/bus/':
                        // if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
                        //     $scope.SearchFormExpandPadding = {'padding-top': 0}
                        // }else{
                        // $timeout(function () {
                        //     $scope.isVisibleNotifNewDesign = true;
                        //
                        // }, 3000);
                        $scope.FormExpand = true;
                        $scope.SearchFormExpandPadding = {'display': 'flex'};
                        document.addEventListener('scroll', onScroll, false);
                        // }
                        break;
                    default:
                        // $scope.isVisibleNotifNewDesign = false;
                        $scope.FormExpand = false;

                        document.removeEventListener('scroll', onScroll, false);
                        break;
                }
                switch ($location.$$path) {
                    case '/':
                    case '/avia/':
                    case '/tours/':
                    case '/packages/':
                    case '/hotels/':
                    case '/bus/':
                            $scope.isEnableSearchForm = true;
                        break;
                    default:
                        $scope.isEnableSearchForm = false;
                        break;
                }
                switch ($location.$$path) {
                    case '/contacts/':
                    case '/tours/':
                    case '/about/':
                    case '/where-to-buy/':
                    case '/certificates/':
                    case '/certificates_kit/':
                    case '/individualtours/':
                    case '/transfers/':
                        $scope.FormExpand = true;
                        $scope.StaticPage = false;
                        $scope.SearchFormExpandPadding = {'display': 'none'};
                        break;
                    default:
                        $scope.StaticPage = false;
                        break;
                }
            });

            // $scope.closeNotifNewDesign = function () {
            //     $scope.isVisibleNotifNewDesign = false;
            // };

            var onScroll = function () {
                var scroll = utils.getScrollTop();
                //if (scroll > 155) {
                //    $scope.$apply(function ($scope) {
                //        $scope.FormExpand = false;
                //        $scope.SearchFormExpandPadding = {'padding-top': 0};
                //    });
                // } else {
                //    $scope.$apply(function ($scope) {
                //        $scope.FormExpand = true;
                //        $scope.SearchFormExpandPadding = {'padding-top': 250 - scroll};
                //    });
                //}
            };

            (function __INITIAL__() {

                //параметры забираются из урла и до # (location.search) и после ($location.search())

                //yandex
                var label = getParameterByName('label') || $location.search().label;
                var from = getParameterByName('from') || $location.search().from;
                var tourist = getParameterByName('tourist') || $location.search().tourist;
                var fromParam = getParameterByName('from_param') || $location.search().from_param;

                var partnerMarker = getParameterByName('PartnerMarker') || getParameterByName('partnermarker') || getParameterByName('partner_marker')
                    || $location.search().PartnerMarker || $location.search().partnermarker || $location.search().partner_marker;

                var idPartner = getParameterByName('id_partner') || $location.search().id_partner;
                var data = getParameterByName('data') || $location.search().data;

                var advParams = {
                    from: from || '',
                    tourist: tourist || '',
                    from_param: fromParam || '',
                    PartnerMarker: label || partnerMarker || '',//label перекрывает partnerMarker
                    id_partner: idPartner || '',
                    data: data || ''
                };

                delete $location.$$search.from;
                delete $location.search().tourist;
                delete $location.$$search.from_param;

                delete $location.$$search.PartnerMarker;
                delete $location.$$search.partnermarker;
                delete $location.$$search.partner_marker;

                delete $location.$$search.id_partner;
                delete $location.$$search.data;
                $location.$$compose();
                if(advParams.from || advParams.PartnerMarker){
                    console.log('advParams', advParams);
                    dataService.getPartnershipCookie(advParams);
                }

                function getParameterByName(name) {
                    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                        results = regex.exec(location.search);
                    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
                }


                //partners
                if (window.partners && window.partners.partnerOperatorId && window.partners.innaOperatorId) {
                    var dataSingIn = {
                        InnaUserId: window.partners.innaOperatorId,
                        ExternalUserId: window.partners.partnerOperatorId
                    };
                    console.log('AuthDataProvider.signIn', dataSingIn);
                    AuthDataProvider.signInWL(dataSingIn,
                        function (data) { //success
                            console.log('AuthDataProvider.signIn success', data);
                            $scope.$emit(Events.AUTH_SIGN_IN, data);
                        }, function (err) { //error
                            console.log('AuthDataProvider.signIn error', err);
                        });
                }
            })();
        }]);
