innaAppDirectives.directive('searchFormBus', function ($templateCache) {
    return {
        replace: true,
        template: $templateCache.get("components/search-form-bus/templ/form.html"),
        controller: function ($element, $scope, $routeParams, $timeout, $location, AppRouteUrls, HotelService, dataService, widgetValidators, $q) {


            $scope.hotelsSearchForm = {};
            $scope.hotelsSearchForm.NightCount = 2;

            $scope.childrenCount = 0;
            /**
             * BEGIN
             * установка значения поля Adult формы поиска
             */
            if ($routeParams.Adult) {
                $scope.hotelsSearchForm.Adult = $routeParams.Adult;
            } else {
                $scope.hotelsSearchForm.Adult = 2;
            }
            if($routeParams.Children) {
                $scope.hotelsSearchForm.Children = $routeParams.Children.split('_').map(function (age) {
                    return { value: age };
                });
                $scope.hotelsSearchForm.ChildrenCount = $scope.hotelsSearchForm.Children.length;
            }else{
                $scope.hotelsSearchForm.Children = [];
                $scope.hotelsSearchForm.ChildrenCount = $scope.hotelsSearchForm.Children.length;
            }
            /**
             * END
             */


            /**
             * BEGIN
             * установка значения поля ArrivalId формы поиска из $routeParams
             */
            if ($routeParams.ArrivalId) {
                $scope.hotelsSearchForm.ArrivalId = $routeParams.ArrivalId;
            } else {
                $scope.hotelsSearchForm.ArrivalId = 6733;
            }
            $scope.cities = [
                { Name: 'Москва', Id: 6733 },
                { Name: 'Санкт-Петербург', Id: 3005 }
            ]
            /**
             * END
             */


            /**
             * BEGIN datapicker
             *
             *
             *
             */
            var datepickerElem = $element.find('.b-search-form-hotels__input-datapicker');
            $element.find(".b-search-form-hotels__field-icon").on('click', function (e) {
                e.preventDefault();
                datepickerElem.trigger('focus');
            });
            $scope.setStartDate = new Date();
            datepickerElem.datepicker({
                format: "d M yyyy",
                startDate: new Date($scope.setStartDate.valueOf() + 86400000 * 1),
                endDate: new Date($scope.setStartDate.valueOf() + 86400000 * 365),
                language: "ru",
                autoclose: true,
                todayHighlight: true,
                toggleActive: true
            }).on('show', function () {
                /**
                 * fix
                 * https://innatec.atlassian.net/browse/IN-4644
                 */
                $(".datepicker .datepicker-switch").on('click', function (e) {
                    e.stopPropagation();
                })
            })
            /**
             * установка значения датепикера из $routeParams
             */
            if ($routeParams.StartVoyageDate) {
                var selectedDate = moment($routeParams.StartVoyageDate, 'YYYY MM DD');
                $timeout(function () {
                    datepickerElem.datepicker('update', new Date(selectedDate.valueOf()));
                }, 0);
            }
            /**
             *
             *
             *
             * END datepicker
             */


            /**
             * BEGIN hotelsSearchStart
             * params:
             * ArrivalId=6733&StartVoyageDate=2016-05-24&NightCount=2&Adult=2
             */
            $scope.hotelsSearchStart = function (event) {
                event.preventDefault();

                var searchUrl = HotelService.getBusIndexUrl($scope.hotelsSearchForm);

                var validateArrivalId = widgetValidators.required($scope.hotelsSearchForm.ArrivalId, 'ArrivalId', 'Введите город или страну, куда планируете поехать');
                var validateStartVoyageDate = widgetValidators.required($scope.hotelsSearchForm.StartVoyageDate, 'StartVoyageDate', 'Выберите дату заезда');

                console.log(searchUrl);
                console.log('ADULT', $scope.hotelsSearchForm.Adult);
                $q.all([validateArrivalId, validateStartVoyageDate])
                    .then(function (data) {
                        $location.path(searchUrl);
                    }, function (error) {
                        showError(error);
                    });

            };

            function showError (error) {
                if (error.name == 'ArrivalId') {
                    $scope.ArrivalIdError = error.error;
                }
                if (error.name == 'StartVoyageDate') {
                    $scope.StartVoyageDateError = error.error;
                }
            };
            /**
             * END hotelsSearchStart
             */

        }
    }
});
