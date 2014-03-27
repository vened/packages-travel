﻿
'use strict';

/* Controllers */

innaAppControllers.
    controller('AviaSearchResultsCtrl', ['$log', '$scope', '$routeParams', '$filter', '$location', 'dataService',
        function AviaSearchResultsCtrl($log, $scope, $routeParams, $filter, $location, dataService) {

            var self = this;
            function log(msg) {
                $log.log(msg);
            }

            var urlDataLoaded = { fromLoaded: false, toLoaded: false };
            //начинаем поиск, после того, как подтянули все данные
            function ifDataLoadedStartSearch() {
                if (urlDataLoaded.fromLoaded == true && urlDataLoaded.toLoaded == true) {
                    //log('ifDataLoadedStartSearch start search');
                    $scope.startSearch();
                }
                else {
                    //log('ifDataLoadedStartSearch waiting');
                }
            }

            //все обновления модели - будут раз в 100 мс, чтобы все бегало шустро
            var applyFilterThrottled = _.debounce(function ($scope) {
                //log('applyFilterThrottled');
                applyFilterDelayed($scope);
            }, 100);
            var applyFilterDelayed = function ($scope) {
                //log('applyFilterDelayed: scope' + scope);
                $scope.$apply(function () { applyFilter($scope); });
            };

            //инициализация
            initValues();
            initFuctions();
            initWatch();

            //обрабатываем параметры из url'а
            var routeCriteria = new aviaCriteria(UrlHelper.restoreAnyToNulls(angular.copy($routeParams)));
            $scope.criteria = routeCriteria;
            log('routeCriteria: ' + angular.toJson($scope.criteria));

            //запрашиваем парамерты по их Url'ам
            setFromAndToFieldsFromUrl();

            function initValues() {
                //флаг индикатор загрузки
                $scope.isDataLoading = true;

                //фильтр
                $scope.filter = new aviaFilter();

                //списки
                $scope.ticketsList = null;
                $scope.filteredTicketsList = null;
                $scope.searchId = 0;

                //сортировка - по-молчанию - по рекомендациям
                //$scope.sort = avia.sortType.ByRecommend;

                $scope.sort = avia.sortType.byRecommend;
                $scope.reverse = false;
                $scope.sortType = avia.sortType;
                $scope.dateFormat = avia.dateFormat;
                $scope.timeFormat = avia.timeFormat;

                //флаг, когда нужно придержать обновление фильтра
                $scope.isSuspendFilterWatch = false;

            };

            function initWatch() {
                //изменение модели фильтра
                $scope.$watch('filter', function (newValue, oldValue) {
                    if (newValue === oldValue) {
                        return;
                    }
                    //log('$scope.$watch filter, scope:' + $scope);
                    applyFilterThrottled($scope);
                }, true);
            };

            function initFuctions() {
                $scope.startSearch = function () {
                    log('$scope.startSearch');
                    dataService.startAviaSearch($scope.criteria, function (data) {
                        //обновляем данные
                        if (data != null) {
                            //log('data: ' + angular.toJson(data));
                            updateModel(data);
                        }
                    }, function (data, status) {
                        //ошибка получения данных
                        log('startSearchTours error; status:' + status);
                    });
                };

                $scope.applySort = function(type){
                    log('applySort: ' + type + ', $scope.sort:' + $scope.sort + ', $scope.reverse:' + $scope.reverse);

                    var reverse = false;
                    if ($scope.sort == type)
                        reverse = !$scope.reverse;
                    else
                        reverse = false;

                    $scope.sort = type;
                    $scope.reverse = reverse;
                };
            };

            function setFromAndToFieldsFromUrl() {
                if (routeCriteria.FromUrl != null && routeCriteria.FromUrl.length > 0) {
                    $scope.criteria.From = 'загружается...';
                    dataService.getDirectoryByUrl(routeCriteria.FromUrl, function (data) {
                        //обновляем данные
                        if (data != null) {
                            $scope.criteria.From = data.name;
                            $scope.criteria.FromId = data.id;
                            $scope.criteria.FromUrl = data.url;
                            //logCriteriaData();
                            log('$scope.criteria.From: ' + angular.toJson($scope.criteria));
                            urlDataLoaded.fromLoaded = true;
                            ifDataLoadedStartSearch();
                        }
                    }, function (data, status) {
                        //ошибка получения данных
                        log('getDirectoryByUrl error: ' + $scope.criteria.FromUrl + ' status:' + status);
                    });
                }
                else
                    urlDataLoaded.fromLoaded = true;

                if (routeCriteria.ToUrl != null && routeCriteria.ToUrl.length > 0) {
                    $scope.criteria.To = 'загружается...';
                    dataService.getDirectoryByUrl(routeCriteria.ToUrl, function (data) {
                        //обновляем данные
                        if (data != null) {
                            $scope.criteria.To = data.name;
                            $scope.criteria.ToId = data.id;
                            $scope.criteria.ToUrl = data.url;
                            //logCriteriaData();
                            log('$scope.criteria.To: ' + angular.toJson($scope.criteria));
                            urlDataLoaded.toLoaded = true;
                            ifDataLoadedStartSearch();
                        }
                    }, function (data, status) {
                        //ошибка получения данных
                        log('getDirectoryByUrl error: ' + $scope.criteria.ToUrl + ' status:' + status);
                    });
                }
                else
                    urlDataLoaded.toLoaded = true;
            };

            function updateModel(data) {
                log('updateModel');

                function dateToMillisecs(date) {
                    var res = dateHelper.apiDateToJsDate(date);
                    if (res != null)
                        return res.getTime();
                    else
                        return null;
                };

                //формат дат
                var monthEnToRus = [
                    { En: "Jan", Ru: "января" },
                    { En: "Feb", Ru: "февраля" },
                    { En: "Mar", Ru: "марта" },
                    { En: "Apr", Ru: "апреля" },
                    { En: "May", Ru: "мая" },
                    { En: "Jun", Ru: "июня" },
                    { En: "Jul", Ru: "июля" },
                    { En: "Aug", Ru: "августа" },
                    { En: "Sep", Ru: "сентября" },
                    { En: "Oct", Ru: "октября" },
                    { En: "Nov", Ru: "ноября" },
                    { En: "Dec", Ru: "декабря" }];

                var weekDaysEnToRus = [
                    { En: "Mon", Ru: "пн" },
                    { En: "Tue", Ru: "вт" },
                    { En: "Wed", Ru: "ср" },
                    { En: "Thu", Ru: "чт" },
                    { En: "Fri", Ru: "пт" },
                    { En: "Sat", Ru: "сб" },
                    { En: "Sun", Ru: "вс" }];

                function changeEnToRu(text) {
                    var dic = monthEnToRus;
                    for (var i = 0; i < dic.length; i++) {
                        var dicItem = dic[i];
                        if (text.indexOf(dicItem.En) > -1) {
                            text = text.replace(dicItem.En, dicItem.Ru);
                            break;
                        }
                    }
                    dic = weekDaysEnToRus;
                    for (var i = 0; i < dic.length; i++) {
                        var dicItem = dic[i];
                        if (text.indexOf(dicItem.En) > -1) {
                            text = text.replace(dicItem.En, dicItem.Ru);
                            break;
                        }
                    }
                    return text;
                }

                var timeFormat = "HH:mm";
                var dateFormat = "dd MMM yyyy, EEE";

                function getTimeFormat(dateText) {
                    return $filter("date")(dateText, timeFormat);
                }

                function getDateFormat(dateText) {
                    return changeEnToRu($filter("date")(dateText, dateFormat));
                }

                //код компании
                function getTransporterCode(etapsTo) {
                    var manyCode = "any";
                    var manyName = "any";
                    if (etapsTo != null)
                    {
                        if (etapsTo.length == 1){
                            return { name: etapsTo[0].TransporterName, code: etapsTo[0].TransporterCode };
                        }
                        else if (etapsTo.length > 1)
                        {
                            var firstCode = etapsTo[0].TransporterCode;
                            var firstName = etapsTo[0].TransporterName;
                            for (var i = 1; i < etapsTo.length; i++) {
                                if (etapsTo[i].TransporterCode != firstCode)
                                {
                                    //коды отличаются - возвращаем 
                                    return { name: manyName, code: manyCode };
                                }
                            }
                            //коды не отличаются - возвращаем код
                            return { name: firstName, code: firstCode };
                        }
                    }
                }

                //время в пути
                function getFlightTimeFormatted(time) {
                    if (time != null)
                    {
                        //вычисляем сколько полных часов
                        var h = Math.floor(time / 60);
                        var addMins = time - h * 60;
                        //return h + " ч " + addMins + " мин" + " (" + time + ")";//debug
                        if (addMins == 0)
                            return h + " ч";
                        else
                            return h + " ч " + addMins + " мин";
                    }
                    return "";
                }

                if (data != null && data.Items != null && data.Items.length > 0) {
                    var list = [];
                    //нужно добавить служебные поля для сортировки по датам
                    //в этих полях дата будет в миллисекундах
                    for (var i = 0; i < data.Items.length; i++) {
                        var item = data.Items[i];
                        item.sort = {
                            DepartureDate: dateToMillisecs(item.DepartureDate),
                            ArrivalDate: dateToMillisecs(item.ArrivalDate),
                            BackDepartureDate: dateToMillisecs(item.BackDepartureDate),
                            BackArrivalDate: dateToMillisecs(item.BackArrivalDate)
                        };
                        //дополняем полями с форматированной датой и временем
                        item.DepartureTimeFormatted = getTimeFormat(item.DepartureDate);
                        item.DepartureDateFormatted = getDateFormat(item.DepartureDate);
                        item.ArrivalTimeFormatted = getTimeFormat(item.ArrivalDate);
                        item.ArrivalDateFormatted = getDateFormat(item.ArrivalDate);

                        item.BackDepartureTimeFormatted = getTimeFormat(item.BackDepartureDate);
                        item.BackDepartureDateFormatted = getDateFormat(item.BackDepartureDate);
                        item.BackArrivalTimeFormatted = getTimeFormat(item.BackArrivalDate);
                        item.BackArrivalDateFormatted = getDateFormat(item.BackArrivalDate);

                        //TransporterCode
                        var codeEtapsTo = getTransporterCode(item.EtapsTo);
                        var codeEtapsBack = getTransporterCode(item.EtapsBack);
                        item.EtapsToTransporterCodeUrl = "http://adioso.com/media/i/airlines/" + codeEtapsTo.code + ".png";
                        item.EtapsToTransporterName = codeEtapsTo.name;
                        item.EtapsBackTransporterCodeUrl = "http://adioso.com/media/i/airlines/" + codeEtapsBack.code + ".png";
                        item.EtapsBackTransporterName = codeEtapsBack.name;

                        //время в пути
                        item.TimeToFormatted = getFlightTimeFormatted(item.TimeTo);
                        item.TimeBackFormatted = getFlightTimeFormatted(item.TimeBack);

                        list.push(item);
                    }
                    //добавляем список
                    $scope.ticketsList = list;

                    updateFilter(data.Items);
                }
                else
                {
                    $scope.ticketsList = [];
                    log('updateModel - nothing to update, data is empty');
                    $scope.isDataLoading = false;
                }
            };

            function updateFilter(items) {
                var filter = {};

                //мин / макс цена
                filter.minPrice = _.min(items, function (item) { return item.Price; }).Price;
                filter.maxPrice = _.max(items, function (item) { return item.Price; }).Price;

                //получаем список кол-ва пересадок [{count:0, checked: false}, {count:1, checked: false}]
                var toList = _.map(items, function (item) { return item.ToTransferCount; });
                toList = _.uniq(toList);
                filter.ToTransferCountList = _.map(toList, function (item) {
                    return {
                        value: item,
                        checked: true
                    }
                });
                filter.ToTransferCountList = _.sortBy(filter.ToTransferCountList,
                    function (item) { return item.value; });

                //пересадки обратно
                var backList = _.map(items, function (item) { return item.BackTransferCount; });
                backList = _.uniq(backList);
                filter.BackTransferCountList = _.map(backList, function (item) {
                    return {
                        value: item,
                        checked: true
                    }
                });
                filter.BackTransferCountList = _.sortBy(filter.BackTransferCountList,
                    function (item) { return item.value; });

                //список авиа компаний
                filter.TransporterList = [];
                _.each(items, function (item) {
                    _.each(item.EtapsTo, function (etap) {
                        filter.TransporterList.push(
                            new transporter(etap.TransporterName, etap.TransporterCode, etap.TransporterLogo))
                    });
                    _.each(item.EtapsBack, function (etap) {
                        filter.TransporterList.push(
                            new transporter(etap.TransporterName, etap.TransporterCode, etap.TransporterLogo))
                    });
                });
                //находим уникальные
                filter.TransporterList = _.uniq(filter.TransporterList, false, function (item) {
                    return item.TransporterCode;
                });


                //мин / макс время отправления туда обратно
                filter.minDepartureDate = _.min(items, function (item) { return item.sort.DepartureDate; }).sort.DepartureDate;
                filter.maxDepartureDate = _.max(items, function (item) { return item.sort.DepartureDate; }).sort.DepartureDate;
                filter.minArrivalDate = _.min(items, function (item) { return item.sort.ArrivalDate; }).sort.ArrivalDate;
                filter.maxArrivalDate = _.max(items, function (item) { return item.sort.ArrivalDate; }).sort.ArrivalDate;
                filter.minBackDepartureDate = _.min(items, function (item) { return item.sort.BackDepartureDate; }).sort.BackDepartureDate;
                filter.maxBackDepartureDate = _.max(items, function (item) { return item.sort.BackDepartureDate; }).sort.BackDepartureDate;
                filter.minBackArrivalDate = _.min(items, function (item) { return item.sort.BackArrivalDate; }).sort.BackArrivalDate;
                filter.maxBackArrivalDate = _.max(items, function (item) { return item.sort.BackArrivalDate; }).sort.BackArrivalDate;

                //задаем фильтр
                $scope.filter = new aviaFilter(filter);
                //log('updateFilter ' + angular.toJson($scope.filter));
                log('updateFilter');
            };

            function applyFilter($scope) {
                var filteredList = [];

                //туда, флаг, что хоть что-то выбрано
                var anyToTransferCountChecked = _.any($scope.filter.ToTransferCountList, function (item) { return item.checked == true });
                //список выбранных значений
                var toTransferCountCheckedList = _.filter($scope.filter.ToTransferCountList, function (item) { return item.checked == true });
                toTransferCountCheckedList = _.map(toTransferCountCheckedList, function (item) { return item.value });

                //обратно
                var anyBackTransferCountChecked = _.any($scope.filter.BackTransferCountList, function (item) { return item.checked == true });
                var backTransferCountCheckedList = _.filter($scope.filter.BackTransferCountList, function (item) { return item.checked == true });
                backTransferCountCheckedList = _.map(backTransferCountCheckedList, function (item) { return item.value });

                //выбрана хотя бы одна компания
                var anyTransporterChecked = _.any($scope.filter.TransporterList, function (item) { return item.checked == true });
                //список всех выбранных а/к
                var transporterListCheckedList = _.filter($scope.filter.TransporterList, function (item) { return item.checked == true });
                transporterListCheckedList = _.map(transporterListCheckedList, function (item) { return item.TransporterCode });

                if ($scope.ticketsList != null) {
                    for (var i = 0; i < $scope.ticketsList.length; i++) {
                        var item = $scope.ticketsList[i];

                        //итем в массиве выбранных значений туда
                        var itemInToCount = (_.indexOf(toTransferCountCheckedList, item.ToTransferCount) > -1);
                        //обратно
                        var itemInBackCount = (_.indexOf(backTransferCountCheckedList, item.BackTransferCount) > -1);

                        //а/к - авиакомпании item'а входят в разрешенный список
                        var itemInTransportTo = _.all(item.EtapsTo, function (etap) {
                            return (_.indexOf(transporterListCheckedList, etap.TransporterCode) > -1);
                        });
                        var itemInTransportBack = _.all(item.EtapsBack, function (etap) {
                            return (_.indexOf(transporterListCheckedList, etap.TransporterCode) > -1);
                        });
                        var itemInTransport = (itemInTransportTo && itemInTransportBack);

                        //проверяем цену
                        if (item.Price >= $scope.filter.minPrice && item.Price <= $scope.filter.maxPrice
                            //пересадки туда
                            && (anyToTransferCountChecked && itemInToCount)
                            //пересадки обратно
                            && (anyBackTransferCountChecked && itemInBackCount)
                            //а/к
                            && (anyTransporterChecked && itemInTransport)
                            //дата отправления / прибытия  туда / обратно
                            && (item.sort.DepartureDate >= $scope.filter.minDepartureDate && item.sort.DepartureDate <= $scope.filter.maxDepartureDate)
                            && (item.sort.ArrivalDate >= $scope.filter.minArrivalDate && item.sort.ArrivalDate <= $scope.filter.maxArrivalDate)
                            && (item.sort.BackDepartureDate >= $scope.filter.minBackDepartureDate && item.sort.BackDepartureDate <= $scope.filter.maxBackDepartureDate)
                            && (item.sort.BackArrivalDate >= $scope.filter.minBackArrivalDate && item.sort.BackArrivalDate <= $scope.filter.maxBackArrivalDate)
                            )
                        {
                            filteredList.push(item);
                        }
                    }

                    $scope.filteredTicketsList = filteredList;
                }

                $scope.isDataLoading = false;
            };
        }]);
