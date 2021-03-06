(function () {
    "use strict"

    var app = angular.module("innaSearchForm");

    if (window.$ && angular.bootstrap) {
        $(function () {
            angular.bootstrap($("html"), ['innaSearchForm']);
        });
    }


    /**
     * BEGIN Bootstrap form
     */
    app.controller('FormBootstrapCtrl', [
        '$scope',
        '$sce',
        function ($scope, $sce) {

            $scope.style = {};
            $scope.style.width = 960;
            $scope.style.widthMax = 960;
            $scope.style.widthMin = 300;

            $scope.style.formTypeActive = 1;
            $scope.style.enabledDpForm = true;
            $scope.style.enabledAviaForm = true;

            $scope.radioModel = 'b-inna-search-widget-row-1';
            $scope.style.formBg = '#212121';
            $scope.style.formColorText = '#ffffff';
            $scope.style.btnBg = '#89c13a';
            $scope.style.btnColor = '#ffffff';
            $scope.style.borderRadius = 2;


            $scope.style.partner = 'biletix';
            $scope.style.url = 'http://biletix.inna.ru';
            $scope.style.defaultCity = 'Москва';

            $scope.$watch('style.enabledAviaForm', function (data) {
                if (!data) {
                    $scope.style.formTypeActive = 1;
                    $scope.style.enabledAviaFormDisabled = true;
                } else {
                    $scope.style.enabledAviaFormDisabled = false;
                }
            })

            $scope.$watchCollection('style', function (data) {

                if (data.width > 900) {
                    $scope.radioModel = 'b-inna-search-widget-row-1';
                }
                if (data.width <= 900 && data.width > 460) {
                    $scope.radioModel = 'b-inna-search-widget-row-2';
                }
                if (data.width <= 580) {
                    $scope.radioModel = 'b-inna-search-widget-row-3';
                }

                $scope.formStyle =
                    '<style>' +

                    '.b-inna-search-widget{width:' + data.width + 'px;}' +

                    '.b-inna-search__nav li::before,' +
                    '.b-inna-search-form{background-color:' + data.formBg + '}' +
                    '.b-inna-search__nav li, ' +
                    '.b-inna-search-form{color:' + data.formColorText + ';}' +

                    '.datepicker .table-condensed > tbody > tr > td:hover,' +
                    '.datepicker table > tbody > tr > td:hover,' +
                    '.datepicker .table-condensed > tbody > tr > td.selected,' +
                    '.datepicker table > tbody > tr > td.selected,' +
                    '.b-inna-btn{background-color:' + data.btnBg + ';color:' + data.btnColor + ';}' +


                    '.b-inna-counter__plus:hover,' +
                    '.b-inna-counter__plus:active,' +
                    '.b-inna-counter__minus:hover,' +
                    '.b-inna-counter__minus:active{background-color:' + data.btnBg + ';color:' + data.btnColor + ';}' +

                    '.datepicker .table-condensed > tbody > tr > td.today, ' +
                    '.datepicker table > tbody > tr > td.today{color: ' + data.btnBg + '}' +

                    '.datepicker table th.prev:active{background-color:' + data.btnBg + '}' +
                    '.datepicker table th.next:active{background-color:' + data.btnBg + '}' +
                    '.datepicker table th.prev:active:before{border-color: transparent ' + data.btnBg + ' transparent transparent}' +
                    '.datepicker table th.next:active:before{border-color: transparent transparent transparent' + data.btnBg + '}' +

                    '.b-inna-btn:hover{background-color:' + data.btnBg + ';color:' + data.btnColor + ';}' +
                    '.datepicker-checkbox:before{border-color:' + data.btnBg + '}' +
                    '.datepicker-checkbox.checked:before{background-color:' + data.btnBg + '}' +
                    '.widget-checkboxes-label input + i{border-color:' + data.btnBg + '}' +
                    '.widget-checkboxes-label input:checked + i{background-color:' + data.btnBg + '}' +
                    '.inna-dropdown-dialog-btns_btn.selected{background-color:' + data.btnBg + ';border-color:' + data.btnBg + '}' +
                    '.inna-dropdown-dialog-btns_btn.selected + .inna-dropdown-dialog-btns_btn{border-left-color:' + data.btnBg + '}' +

                    '.datepicker .table-condensed > tbody > tr > td.range,' +
                    '.datepicker table > tbody > tr > td.range{background-color:' + data.btnBg + ';opacity: .6;}' +

                    '.b-inna-search-form-field-input:focus{box-shadow: inset 0 0 4px ' + data.btnBg + ';border-color:' + data.btnBg + '}' +
                    '.inna-dropdown.open .inna-dropdown-action{box-shadow: inset 0 0 4px ' + data.btnBg + ';border-color:' + data.btnBg + '}' +

                    '.b-inna-search-form-field .dropdown-menu li:first-child, ' +
                    '.b-inna-search__nav li{border-radius:' + data.borderRadius + 'px ' + data.borderRadius + 'px 0 0;}' +

                    '.b-inna-search-form-field .dropdown-menu li:last-child{border-radius: 0 0 ' + data.borderRadius + 'px ' + data.borderRadius + 'px;}' +

                    '.b-inna-search-form{border-radius:0 ' + data.borderRadius + 'px ' + data.borderRadius + 'px;}' +

                    '.inna-dropdown, .b-inna-btn, .b-inna-search-form-field .dropdown-menu,' +
                    '.b-inna-search-form-field-input{border-radius:' + data.borderRadius + 'px;}' +

                    '</style>'
            })


            $scope.insertStyle = function () {
                return $sce.trustAsHtml($scope.formStyle);
            };

            $scope.generateCode = function () {
                $scope.error = {}
                if (!$scope.style.partner) {
                    $scope.error.partner = true;
                } else {
                    $scope.formTpl = [
                        '<textarea class="form-control">',
                        '<div class="b-inna-search-widget ' + $scope.radioModel + '">',
                        '<inna-form ',
                        'partner-site="' + $scope.style.url + '" ',
                        'partner-name="' + $scope.style.partner + '" ',
                        'partner-default-city="' + $scope.style.defaultCity + '" ',
                        'enabled-dp-form="' + $scope.style.enabledDpForm + '" ',
                        'enabled-avia-form="' + $scope.style.enabledAviaForm + '" ',
                        'form-type-active="' + $scope.style.formTypeActive + '" ',
                        '></inna-form>',
                        '</div>',
                        '<script src="https://inna.ru/spa/js/widgets/search/inna-search.js" async="true" charset="utf-8"></script>',
                        $scope.formStyle,
                        '</textarea>']
                        .join("\n");
                    $scope.insertTpl = function () {
                        return $sce.trustAsHtml($scope.formTpl);
                    };
                }
            }

        }
    ]);
    /**
     * END Bootstrap form
     */
    // app.directive('innaOffer', ['$templateCache', function ($templateCache) {
    //     return {
    //         restrict: 'E',
    //         template: function () {
    //             return $templateCache('LK/offer.html');
    //         },
    //         scope: {
    //             // partnerSite: "@",
    //             // partnerName: "@",
    //         },
    //         controller: function ($element, $scope, $http, $q) {
    //             // $scope.partnerDefaultLocation = 'Россия';
    //             $scope.isGetCode = false;
    //             $scope.offer = null;
    //
    //             $scope.getOffer = function () {
    //                 $q.all([
    //                     $http({
    //                         method: 'GET',
    //                         url: 'https://inna.ru/api/v1/Dictionary/GetCurrentLocation',
    //                         cache: true
    //                     }),
    //                     $http({
    //                         method: 'GET',
    //                         url: 'https://inna.ru/api/v1/Dictionary/Hotel',
    //                         params: {term: $scope.location},
    //                         cache: true
    //                     })
    //                 ]).then(function (result1, result2) {
    //                     var countryIdLocation = result1[0].Id;
    //                     var countryIdTo = result2[0][0].Id;
    //
    //                     return $http({
    //                         method: 'GET',
    //                         url: 'https://inna.ru/api/v1/bestoffer/GetOffersForLocation',
    //                         params: {ArrivalLocation: countryIdTo, Location: 18820},
    //                         cache: true
    //                     })
    //                 }).then(function (result) {
    //                     $scope.offer = result.Offers[0];
    //                 });
    //             };
    //
    //             $scope.getCode = function () {
    //                 $scope.isGetCode = true;
    //             }
    //         }
    //     }
    // }]);
}());