innaAppDirectives.directive('offers', function ($templateCache) {
    return {
        replace: true,
        template: $templateCache.get("components/offers/templ/offers.html"),
        controller: function ($scope, RavenWrapper, serviceCache, Offer, $timeout, EventManager) {
            
            function setDefaultValue(res) {
                
                $scope.Categories = res.data.Categories;
                $scope.Categories.length = 8;
                $scope.Locations = res.data.Locations;
                $scope.Months = res.data.Month;
                $scope.Periods = res.data.Period;
                $scope.Sorts = res.data.Sort;
                
                
                //var LocationObj = _.find($scope.Locations, function (item) {
                //    return item.Selected == true;
                //});
                //if (!LocationObj) {
                //var cacheLocation = serviceCache.getObject('DP_from');
                //var cacheLocationId = cacheLocation ? cacheLocation.Id : 6733;
                //LocationObj = _.find($scope.Locations, function (item) {
                //    return item.Value == cacheLocationId;
                //});
                //$scope.filter.Location = LocationObj.Value;
                //} else {
                //    $scope.filter.Location = LocationObj.Value;
                //}
                var cacheLocation = serviceCache.getObject('DP_from');
                var cacheLocationId = cacheLocation ? cacheLocation.Id : 6733;
                $scope.filter.Location = cacheLocationId;


                var MonthObj = _.find($scope.Months, function (item) {
                    return item.Selected == true;
                });
                $scope.filter.Month = MonthObj.Value;
                
                var PeriodObj = _.find($scope.Periods, function (item) {
                    return item.Selected == true;
                });
                $scope.filter.Period = PeriodObj.Value;
                
                var CategoryObj = _.find($scope.Categories, function (item) {
                    return item.Selected == true;
                });
                $scope.filter.Category = CategoryObj.Value;
                //$scope.setCategory(CategoryObj);
                
                var SortObj = _.find($scope.Sorts, function (item) {
                    return item.Selected == true;
                });
                $scope.Sort = SortObj.Value;
            };
            
            $scope.showOffers = false;
            
            $scope.filter = {
                Category: null,
                Location: null,
                Month: null,
                Period: null
            };
            
            Offer.getOffers().then(
                function (res) {
                    setDefaultValue(res);
                }, function (res) {
                    RavenWrapper.raven({
                        captureMessage: 'Offer.getOffers(): ERROR!',
                        dataResponse: res,
                        dataRequest: null
                    });
                });
            
            $scope.setCategory = function (category) {
                var categories = [];
                for (var i = 0; i < $scope.Categories.length; i++) {
                    var item = $scope.Categories[i];
                    if (category == item) {
                        item.Active = true;
                    } else {
                        item.Active = false;
                    }
                    categories.push(item);
                }
                $scope.Categories = categories;
                $scope.filter.Category = category.Value;
                /**
                 * если локация сохранена в кеше то берем её оттуда
                 * если кэш путой подставляем id Москвы 6733
                 */
                $scope.filterChange($scope.filter);
                EventManager.on("locationSelectorChange", function (data) {
                    $scope.filter.Location = data.Id;
                    $scope.filterChange($scope.filter);
                });

            };

            $scope.loadingOffers = false;
            $scope.filterChange = function (filter) {
                $scope.loadingOffers = true;
                $scope.showOffers = true;
                Offer.getOffers(filter).then(
                    function (res) {
                        if (res.data.Offers.length == 0) {
                            $scope.filter.Location = 6733;
                            $scope.filterChange($scope.filter);
                        } else {
                            $scope.offersServer = res.data.Offers;
                            $scope.showOffers = true;
                            $scope.loadingOffers = false;
                            $scope.offersSort($scope.Sort, $scope.offersServer);
                        }
                    }, function (res) {
                        RavenWrapper.raven({
                            captureMessage: 'Offer.getOffers(filter): ERROR!',
                            dataResponse: res,
                            dataRequest: $scope.filter
                        });
                    });
                
            };
            
            // var offers = Offer.mock(12);
            $scope.offersSort = function (sortableType, offers) {
                $scope.offers = Offer.sortable(sortableType, offers);
            };
            
        }
    }
});
