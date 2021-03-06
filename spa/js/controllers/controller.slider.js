﻿
'use strict';

/* Controllers */

innaAppControllers.
    controller('SliderCtrl', ['$log', '$scope', '$rootScope', '$routeParams', '$filter', '$location', 'dataService', 'sharedProperties',
        function ($log, $scope, $rootScope, $routeParams, $filter, $location, dataService, sharedProperties) {
            function log(msg) {
                $log.log(msg);
            }

            $scope.isNullOrEmpty = function (item) {
                if (item == null || item.length == 0)
                    return true;
                else
                    return false;
            };

            $scope.isFirstSlideDarken = function () {
                if ($scope.slides != null && $scope.slides.length > 0) {
                    return $scope.slides[0].NeedFilterBrightness;
                }
                return true;//по-умолчанию - затемнено
            }

            function preventBubbling($event) {
                if ($event.stopPropagation) $event.stopPropagation();
                if ($event.preventDefault) $event.preventDefault();
                $event.cancelBubble = true;
                $event.returnValue = false;
            }

            $scope.getHref = function (item) {
                var url = item.Url;
                //Url : "http://test.inna.ru/#/individualtours/category/12"
                //отрезаем нежнужное (нужен урл типа /individualtours/category/12)
                var ind = url.indexOf("/#");
                if (ind > -1) {
                    url = url.substring(ind + 2, url.length);
                }
                //url = '/#' + url;
                //log('getHref, url: ' + url);
                return url;
            };

            $scope.offerClickSlider = function (slide, $event, position) {
                $scope.offerClickSliderInternal(slide, $event, position, "slider", "слайдер");
            };

            $scope.offerClickSliderInternal = function (item, $event, position, blockType, sectionName) {
                preventBubbling($event);
                //на компе - кликаем сразу
                click(item);

                function click(item) {
                    //var url = $scope.getHref(item);
                    ////log('offerClick, url: ' + url);
                    //$location.path(url);

                    //пишем статистику и делаем переход
                    track.offerClick(sectionName, blockType, item.Name, position, function () {
                        location.href = item.Url;
                    });
                    //location.href = item.Url;
                }
            };

            //регистрируемся для получения данных для слайдера
            //sharedProperties.sliderUpdateCallback(function (data) {
            //    $scope.slides = sharedProperties.getSlider();
            //    //log('slider, sliderUpdateCallback, len: ' + $scope.slides.length);

            //    //событие - после которого отрабатывают jq скрипты для слайдера
            //    $scope.$broadcast('sliderDataLoaded');
            //});
            
            $scope.$on('slider.set.content', function (event, data) {
                //console.log('slider.set.content:');
                //console.log(data);
                $scope.slides = data;
                $scope.$broadcast('sliderDataLoaded');
            });
            
        }]);