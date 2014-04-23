﻿innaAppServices.
    factory('paymentService', ['$rootScope', '$timeout', '$http', '$q', '$log', 'cache', 'storageService', 'innaApp.API.const',
        function ($rootScope, $timeout, $http, $q, $log, cache, storageService, apiUrls) {
            function log(msg) {
                $log.log(msg);
            }

            return {
                checkAvailability: function (queryData, successCallback, errCallback) {
                    
                    //проверяем что данные не старше минуты
                    var res = storageService.getAviaVariantCheck(queryData);
                    if (res != null) {
                        successCallback(res);
                    }
                    else {
                        $http.get(paymentCheckAvailabilityUrl, { params: queryData }).success(function (data) {
                            storageService.setAviaVariantCheck({ date: new Date().getTime(), params: queryData, data: data });
                            successCallback(data);
                            //ToDo: debug
                            //$timeout(function () {
                            //    storageService.setAviaVariantCheck({ date: new Date().getTime(), params: queryData, data: data });
                            //    successCallback(data);
                            //}, 1000);
                        }).
                        error(function (data, status) {
                            errCallback(data, status);
                        });
                    }
                },

                getTransportersInAlliances: function (queryData, successCallback, errCallback) {
                    $http.get(apiUrls.PURCHASE_TRANSPORTER_GET_ALLIANCE, { cache: false, params: { names: queryData } }).success(function (data, status) {
                        successCallback(data);
                    }).
                    error(function (data, status) {
                        errCallback(data, status);
                    });
                },

                reserve: function (queryData, successCallback, errCallback) {
                    $http.post(apiUrls.AVIA_RESERVATION, queryData).success(function (data, status) {
                        successCallback(data);
                    }).
                    error(function (data, status) {
                        errCallback(data, status);
                    });
                },

                getSelectedVariant: function (queryData, successCallback, errCallback) {
                    $http.get(apiUrls.AVIA_RESERVATION_GET_VARIANT, { cache: true, params: queryData }).success(function (data, status) {
                        successCallback(data);
                    }).
                    error(function (data, status) {
                        errCallback(data, status);
                    });
                },

                getPaymentData: function(queryData, successCallback, errCallback){
                    $http.get(apiUrls.AVIA_RESERVATION_GET_PAY_DATA, { cache: true, params: queryData }).success(function (data, status) {
                        successCallback(data);
                    }).
                    error(function (data, status) {
                        errCallback(data, status);
                    });
                },

                pay: function (queryData, successCallback, errCallback) {
                    $http.post(apiUrls.AVIA_PAY, queryData).success(function (data, status) {
                        successCallback(data);
                    }).
                    error(function (data, status) {
                        errCallback(data, status);
                    });
                },

                eof: null
            };
        }]);