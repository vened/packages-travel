﻿
/* Controllers */

innaAppControllers.
    controller('AviaReserveTicketsCtrl', ['$log', '$controller', '$timeout', '$scope', '$rootScope', '$routeParams', '$filter', '$location',
        'dataService', 'paymentService', 'storageService', 'aviaHelper', 'eventsHelper', 'urlHelper', 'Validators',
        function AviaReserveTicketsCtrl($log, $controller, $timeout, $scope, $rootScope, $routeParams, $filter, $location,
            dataService, paymentService, storageService, aviaHelper, eventsHelper, urlHelper, Validators) {
            $controller('ReserveTicketsCtrl', { $scope: $scope });

            var self = this;
            function log(msg) {
                $log.log(msg);
            }

            $scope.baloon = aviaHelper.baloon;
            
            //нужно передать в шапку (AviaFormCtrl) $routeParams
            $rootScope.$broadcast("avia.page.loaded", $routeParams);

            //критерии из урла
            $scope.criteria = new aviaCriteria(urlHelper.restoreAnyToNulls(angular.copy($routeParams)));

            //====================================================
            //нужны в родителе
            $scope.fromDate = $scope.criteria.BeginDate;
            $scope.AdultCount = parseInt($scope.criteria.AdultCount);
            $scope.ChildCount = parseInt($scope.criteria.ChildCount);
            $scope.InfantsCount = parseInt($scope.criteria.InfantsCount);
            $scope.peopleCount = $scope.AdultCount + $scope.ChildCount + $scope.InfantsCount;
            //нужны в родителе
            //====================================================

            $scope.searchId = $scope.criteria.QueryId;

            $scope.objectToReserveTemplate = '/spa/templates/pages/avia/variant_partial.html';

            //для начала нужно проверить доступность билетов
            var availableChecktimeout = $timeout(function () {
                $scope.baloon.show('Проверка доступности билетов', 'Подождите пожалуйста, это может затять несколько минут');
            }, 300);
            
            //проверяем, что остались билеты для покупки
            paymentService.checkAvailability({ variantTo: $routeParams.VariantId1, varianBack: $routeParams.VariantId2 },
                function (data) {
                    //data = false;
                    if (data == "true") {
                        //если проверка из кэша - то отменяем попап
                        $timeout.cancel(availableChecktimeout);

                        //log('checkAvailability, true');
                        //$scope.baloon.show("Билеты доступны", "Идет загрузка, пожалуйста подождите");

                        //загружаем все
                        loadDataAndInit();

                        //ToDo: debug
                        //$timeout(function () {
                        //    loadDataAndInit();
                        //}, 1000);
                    }
                    else {
                        //log('checkAvailability, false');
                        $timeout.cancel(availableChecktimeout);

                        $scope.baloon.show("Вариант больше недоступен", "Вы будете направлены на результаты поиска билетов");

                        $timeout(function () {
                            //очищаем хранилище для нового поиска
                            storageService.clearAviaSearchResults();
                            //билеты не доступны - отправляем на поиск
                            var url = urlHelper.UrlToAviaSearch(angular.copy($scope.criteria));
                            $location.path(url);
                            log('redirect to url: ' + url);
                        }, 3000);
                        
                    }
                },
                function (data, status) {
                    //error
                    $timeout.cancel(availableChecktimeout);
                });

            //$scope.$watch('validationModel', function (newVal, oldVal) {
            //    if (newVal === oldVal)
            //        return;

            //}, true);

            //$timeout(function () {
            //    loadToCountryAndInit(routeCriteria);
            //}, 2000);

            function loadDataAndInit() {
                var loader = new utils.loader();

                //data loading ===========================================================================
                function loadToCountry() {
                    var self = this;
                    //log('loadToCountryAndInit');
                    if ($scope.criteria.ToUrl != null && $scope.criteria.ToUrl.length > 0) {

                        dataService.getDirectoryByUrl($scope.criteria.ToUrl, function (data) {
                            if (data != null) {
                                $scope.criteria.To = data.name;
                                $scope.criteria.ToId = data.id;
                                $scope.criteria.ToCountryName = data.CountryName;
                                //оповещаем лоадер, что метод отработал
                                loader.complete(self);
                            }
                        }, function (data, status) {
                            log('loadToCountry error: ' + $scope.criteria.ToUrl + ' status:' + status);
                        });
                    }
                };

                function getStoreItem() {
                    var self = this;
                    var storeItem = null;//storageService.getAviaBuyItem();
                    //log('storeItem: ' + angular.toJson(storeItem));
                    if (storeItem != null) {
                        if (storeItem.item.VariantId2 == null)
                            storeItem.item.VariantId2 = 0;
                        //проверяем, что там наш итем
                        if ($scope.criteria.QueryId == storeItem.searchId &&
                            $scope.criteria.VariantId1 == storeItem.item.VariantId1 && $scope.criteria.VariantId2 == storeItem.item.VariantId2) {
                            $scope.searchId = storeItem.searchId;
                            $scope.item = storeItem.item;

                            //оповещаем лоадер, что метод отработал
                            loader.complete(self);
                        }
                    }
                    else {
                        //запрос в api
                        paymentService.getSelectedVariant({
                            variantId1: $scope.criteria.VariantId1,
                            variantId2: $scope.criteria.VariantId2,
                            idQuery: $scope.criteria.QueryId
                        },
                        function (data) {
                            if (data != null && data != 'null') {
                                //дополняем полями 
                                aviaHelper.addCustomFields(data);
                                //log('getSelectedVariant dataItem: ' + angular.toJson(data));
                                $scope.item = data;
                                //плюс нужна обработка, чтобы в item были доп. поля с форматами дат и прочее

                                //оповещаем лоадер, что метод отработал
                                loader.complete(self);
                            }
                            else
                                $log.error('paymentService.getSelectedVariant error, data is null');
                        },
                        function (data, status) {
                            $log.error('paymentService.getSelectedVariant error');
                        });
                    }
                };

                loader.init([loadToCountry, getStoreItem], init).run();
            };

            function init() {
                $scope.baloon.hide();
                $scope.initPayModel();
            }

            //data loading ===========================================================================

            //бронируем
            function reserve(afterCompleteCallback) {
                function call() { if (afterCompleteCallback) afterCompleteCallback(); };

                function getPassenger(data) {
                    var m = {};
                    m.Sex = data.sex;
                    m.I = data.name;
                    m.F = data.secondName;
                    m.Birthday = data.birthday;
                    m.DocumentId = null;
                    var docsn = data.document.series_and_number.split(' ');
                    m.Series = docsn[0];
                    m.Number = docsn[1];
                    m.ExpirationDate = data.document.expirationDate;
                    m.Citizen = data.citizenship.id;
                    m.Index = data.index;
                    m.BonusCard = data.bonuscard.number;
                    return m;
                }
                function getApiModel(data) {
                    var m = {};
                    m.I = data.name;
                    m.F = data.secondName;
                    m.Email = data.email;
                    m.Phone = data.phone;

                    var pasList = [];
                    _.each(data.passengers, function (item) {
                        pasList.push(getPassenger(item));
                    });
                    m.Passengers = pasList;

                    m.SearchParams = {
                        SearchId: $scope.searchId,
                        VariantId1: $scope.item.VariantId1,
                        VariantId2: $scope.item.VariantId2
                    };
                    return m;
                };

                var apiModel = getApiModel($scope.model);
                log('');
                log('reservationModel: ' + angular.toJson($scope.model));
                log('');
                log('apiModel: ' + angular.toJson(apiModel));
                //
                paymentService.reserve(apiModel,
                    function (data) {
                        log('orderId: ' + data);
                        if (data != null)
                        {
                            //сохраняем orderId
                            //storageService.setAviaOrderId(data);
                            $scope.criteria.OrderId = data;

                            //сохраняем модель
                            storageService.setReservationModel($scope.model);
                        }
                        //успешно
                        call();
                    },
                    function (data, status) {
                        //ошибка
                        log('paymentService.reserve error');
                        call();
                    });
            };

            $scope.processToPayment = function ($event) {
                eventsHelper.preventBubbling($event);

                $scope.validationModel.validateAll();

                //ищем первый невалидный элемент, берем только непустые
                var invalidItem = $scope.validationModel.getFirstInvalidItem(function (item) {
                    return (item.value != null && item.value.length > 0);
                });
                if (invalidItem != null)
                {
                    //показываем тултип
                    var $to = $("#" + invalidItem.id);
                    //не навешивали тултип
                    if (!invalidItem.haveTooltip) {
                        $scope.tooltipControl.init($to);
                        invalidItem.haveTooltip = true;
                    }
                    $scope.tooltipControl.open($to);
                     
                    return;
                }
                return;

                //бронируем
                reserve(function () {
                    if (isAllDataLoaded()) {
                        //переходим на страницу оплаты
                        var url = urlHelper.UrlToAviaTicketsBuy($scope.criteria);
                        //log('processToPayment, url: ' + url);
                        $location.path(url);
                    }
                });
            };

            var debugPassengersList = [
                { name: 'IVAN', secondName: 'IVANOV', sex: $scope.sexType.man, birthday: '18.07.1976', series_and_number: '4507 048200' },
                { name: 'TATIANA', secondName: 'IVANOVA', sex: $scope.sexType.woman, birthday: '25.09.1978', series_and_number: '4507 048232' },
                { name: 'SERGEY', secondName: 'IVANOV', sex: $scope.sexType.man, birthday: '12.07.2006', series_and_number: '4507 028530' },
                { name: 'ELENA', secondName: 'IVANOVA', sex: $scope.sexType.woman, birthday: '12.11.2013', series_and_number: '4507 018530' },
            ];

            //ToDo: debug
            function fillDefaultModelDelay() {
                $timeout(function () {
                    $scope.model.name = 'Иван';
                    $scope.model.secondName = '';
                    $scope.model.email = 'ivan.ivanov@gmail.com';
                    $scope.model.phone = '+79101234567';
                    var index = 0;
                    _.each($scope.model.passengers, function (pas) {

                        if (index < debugPassengersList.length) {
                            var debugItem = debugPassengersList[index];
                            index++;

                            pas.name = debugItem.name;
                            pas.secondName = debugItem.secondName;
                            pas.sex = debugItem.sex;
                            pas.birthday = debugItem.birthday;
                            pas.citizenship.id = 189;
                            pas.citizenship.name = 'Россия';
                            pas.doc_series_and_number = debugItem.series_and_number;
                            pas.doc_expirationDate = '18.07.2015';
                            pas.bonuscard.haveBonusCard = (index % 2 == 0 ? true : false);
                            pas.bonuscard.airCompany.id = 2;
                            pas.bonuscard.airCompany.name = 'Aeroflot';
                            pas.bonuscard.number = '12134а3454';
                        }
                        else {
                            pas.name = 'IVAN';
                            pas.secondName = 'IVANOV';
                            pas.sex = $scope.sexType.man;
                            pas.birthday = '18.07.1976';
                            pas.citizenship.id = 189;
                            pas.citizenship.name = 'Россия';
                            pas.doc_series_and_number = '4507 048200';
                            pas.doc_expirationDate = '18.07.2015';
                            pas.bonuscard.haveBonusCard = true;
                            pas.bonuscard.airCompany.id = 2;
                            pas.bonuscard.airCompany.name = 'Aeroflot';
                            pas.bonuscard.number = '12134а3454';
                        }
                    });
                    
                    //$scope.login.isOpened = true;
                    //$scope.login.isLogged = true;
                }, 2000);
            };

            $scope.afterPayModelInit = fillDefaultModelDelay;
        }]);
