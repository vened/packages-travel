innaAppDirectives

    .directive('widgetCounterPeople', function ($templateCache) {
        return {
            template: function () {
                return $templateCache.get('counter_people.html') ? $templateCache.get('counter_people.html') : $templateCache.get('widgets/search/templ/counter_people.html')
            },
            scope: {
                adultCount: '=',
                childrenCount: '=',
                childrensAge: '=',
                ticketsClass: '='
            },
            controller: ['$scope', function ($scope) {
                /*Properties*/
                $scope.isOpen = false;

                /*Events*/
                $scope.onCounterClick = function (model, count) {
                    $scope[model] = count;
                    if (model == 'childrenCount') {
                        $scope.childrensAge = [];
                        for (var i = 0; i < $scope.childrenCount; i++) {
                            $scope.childrensAge.push({value: 0});
                        }
                    }
                };

                $scope.onAgeSelectorClick = function (num) {
                    var selector = $scope.childrensAge[num];
                    selector.isOpen = !selector.isOpen;
                };

                $scope.sum = function (a, b) {
                    return +a + +b;
                }


                $scope.$watch('ticketsClassBussiness', function (data) {
                    if (data) {
                        $scope.ticketsClassHumanize = 'бизнес';
                        $scope.ticketsClass = 1;
                    } else {
                        $scope.ticketsClassHumanize = 'эконом';
                        $scope.ticketsClass = 0;
                    }
                });


            }],
            link: function (scope, element, attrs) {
                scope.rootElement = $('.search-form-item-current', element);

                $(document).click(function bodyClick(event) {
                    var isInsideComponent = !!$(event.target).closest(element).length;
                    var isOnComponentTitle = event.target == element || event.target == scope.rootElement[0];

                    scope.$apply(function ($scope) {
                        if (isOnComponentTitle) {
                            $scope.isOpen = !$scope.isOpen;
                        } else {
                            $scope.isOpen = isInsideComponent;
                        }
                    });
                });
            }
        }
    })

    .directive('widgetCounterPeopleChildAgeSelector', function ($templateCache) {
        return {
            template: function () {
                return $templateCache.get('counter_people.subcomponent.html') ? $templateCache.get('counter_people.subcomponent.html') : $templateCache.get('widgets/search/templ/counter_people.subcomponent.html')
            },
            replace: true,
            scope: {
                'selector': '='
            },
            controller: ['$scope', function ($scope) {
                $scope.onChoose = function (age) {
                    $scope.selector.value = age;
                }
            }],
            requires: '^counterPeople'
        }
    })

    .directive('widgetErrorTooltip', function ($templateCache, $timeout) {
        return {
            replace: true,
            template: function () {
                return $templateCache.get('error-tooltip.html') ? $templateCache.get('error-tooltip.html') : $templateCache.get('widgets/search/templ/error-tooltip.html')
            },
            scope: {
                error: '@'
            },
            link: function ($scope, element) {

                $scope.$watch('error', function (newValue) {
                    if (newValue != '') {
                        $timeout(function () {
                            var width = element.width();
                            element.css({
                                marginLeft: -width / 2 - 10
                            });
                        }, 0)
                    }
                });
            }
        }
    })

    .directive('widgetAviaCounterPeople', function ($templateCache) {
        return {
            template: function () {
                return $templateCache.get('avia_counter_people.html') ? $templateCache.get('avia_counter_people.html') : $templateCache.get('widgets/search/templ/avia_counter_people.html')
            },
            scope: {
                adultCount: "=",
                childCount: "=",
                infantsCount: "=",
                ticketClass: "="
            },
            controller: function ($scope) {


                $scope.$watch('ticketsClassBussiness', function (data) {
                    if (data) {
                        $scope.ticketsClassHumanize = 'бизнес';
                        $scope.ticketsClass = 1;
                    } else {
                        $scope.ticketsClassHumanize = 'эконом';
                        $scope.ticketsClass = 0;
                    }
                });


                /**
                 * counter
                 */
                var counter = function (count, max, min, inc) {
                    var value = count;
                    if (inc) {
                        if (count < max && inc == 1) {
                            value += 1;
                        }
                        if (count > min && inc == -1) {
                            value -= 1;
                        }
                    } else {
                        if (count < min) {
                            value = min;
                        } else if (count >= max) {
                            value = max;
                        } else {
                            value = count;
                        }
                    }
                    return value;
                }

                /**
                 * max people count - 6
                 */
                $scope.maxPeopleCount = 6;
                $scope.adultCount = 1;
                $scope.childCount = 0;
                $scope.infantsCount = 0;


                $scope.minAdultCount = 1;
                $scope.minChildCount = 0;
                $scope.minInfantsCount = 0;
                
                var maxAdultCount = function(){
                    return $scope.maxPeopleCount - $scope.childCount;
                }
                
                var maxChildCount = function(){
                    return $scope.maxPeopleCount - $scope.adultCount;
                }
                
                var maxInfantsCount = function(){
                    return $scope.adultCount;
                }
                
                /**
                 * adultCount
                 */
                $scope.adultCountInc = function (count, inc) {
                    $scope.adultCount = counter(count, maxAdultCount(), $scope.minAdultCount, inc)
                    if($scope.infantsCount > $scope.adultCount){
                        $scope.infantsCountInc($scope.adultCount);
                    }
                    
                };

                /**
                 * childCount
                 */
                $scope.childCountInc = function (count, inc) {
                    $scope.childCount = counter(count, maxChildCount(), $scope.minChildCount, inc)
                };

                /**
                 * infantsCount
                 */
                $scope.infantsCountInc = function (count, inc) {
                    $scope.infantsCount = counter(count, maxInfantsCount(), $scope.minInfantsCount, inc)
                };


            },
            link: function (scope, element) {
                $(document).click(function (event) {
                    var isInsideComponent = !!$(event.target).closest(element).length;
                    var isOnComponentTitle = !event.target.closest('.inna-dropdown-action');
                    scope.$apply(function ($scope) {
                        if (!isOnComponentTitle) {
                            $scope.isOpen = !$scope.isOpen;
                        } else {
                            $scope.isOpen = isInsideComponent;
                        }
                    });
                });
            }
        }
    });