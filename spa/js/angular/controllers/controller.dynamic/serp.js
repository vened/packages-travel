innaAppControllers
    .controller('DynamicPackageSERPCtrl', [
        '$scope', 'DynamicFormSubmitListener', 'DynamicPackagesDataProvider', 'DynamicPackagesCacheWizard',
        '$routeParams', 'innaApp.API.events', '$location', 'innaApp.Urls', 'aviaHelper',
        function ($scope, DynamicFormSubmitListener, DynamicPackagesDataProvider, DynamicPackagesCacheWizard,
                  $routeParams, Events, $location, Urls, aviaHelper) {
            /*Private*/
            var searchParams = angular.copy($routeParams);
            var cacheKey = '';
            var AS_MAP_CACHE_KEY = 'serp-as-map';

            function loadTab(cb) {
                var method, param, apply;

                if($scope.show == $scope.HOTELS_TAB) {
                    method = 'getHotelsByCombination';
                    param = $scope.combination.AviaInfo.VariantId1;
                    apply = function($scope, data){
                        $scope.hotels = data.Hotels;
                    };
                } else if($scope.show == $scope.TICKETS_TAB) {
                    method = 'getTicketsByCombination';
                    param = $scope.combination.Hotel.HotelId;
                    apply = function($scope, data){
                        $scope.tickets.flush();

                        for(var i = 0, raw = null; raw = data.AviaInfos[i++];) {
                            var ticket = new inna.Models.Avia.Ticket();

                            ticket.setData(raw);

                            $scope.tickets.push(ticket);
                        }
                    };
                }

                if(!method || !param) return;

                DynamicPackagesDataProvider[method](param, searchParams, function(data){
                    $scope.$apply(function($scope){
                        apply($scope, data);

                        (cb || angular.noop)();
                    });
                });
            }

            function doesHotelFit(hotel, filter, value) {
                return doesHotelFit.comparators[filter](hotel, value);
            }

            doesHotelFit.comparators = {
                Stars: function(hotel, value){
                    if(value == 'all') return true;

                    return (hotel.Stars == value);
                },
                Price: function(hotel, value){
                    if(!value) return true;

                    return (hotel.MinimalPackagePrice <= value);
                },
                Name: function(hotel, value){
                    if(!value) return true;

                    return (hotel.HotelName && hotel.HotelName.indexOf(value) !== -1);
                },
                Extra: function(hotel, value){
                    var show = true;

                    for(var option in value) if(value.hasOwnProperty(option)) {
                        if(!value[option]) continue;

                        show = show && hotel[option];
                    }

                    return show;
                }
            };

            function doesTicketFit(ticket, filter, value) {
                return doesTicketFit.comparators[filter](ticket, value);
            }

//            doesTicketFit.comparators = {
//                Time: function(ticket, value) {
//                    var show = false;
//
//                    if(angular.equals(value, {})) return true;
//
//                    $.each(value, function(key, range){
//                        var prop = key.split('.')[0];
//                        show = show || dateHelper.isHoursBetween(ticket[prop], range);
//                    });
//
//                    return show;
//                }
//            };

            function updateCombination(o) {
                if(!$scope.combination) $scope.combination = {};

                for(var p in o) if(o.hasOwnProperty(p)) {
                    $scope.combination[p] = o[p];
                }

                $location
                    .search('hotel',$scope.combination.Hotel.HotelId)
                    .search('ticket', $scope.combination.AviaInfo.VariantId1);
            }

            function balloonCloser() {
                $location.path(Urls.URL_DYNAMIC_PACKAGES);
            }

            /*Constants*/
            $scope.HOTELS_TAB = '/spa/templates/pages/dynamic/inc/serp.hotels.html';
            $scope.TICKETS_TAB = '/spa/templates/pages/dynamic/inc/serp.tickets.html';

            /*Properties*/
            $scope.hotels = [];
            $scope.hotelFilters = {};
            $scope.tickets = new inna.Models.Avia.TicketCollection();
            $scope.ticketFilters = {};
            $scope.combination = null;

            $scope.show = (function(search){
                if(search.displayTicket) return $scope.TICKETS_TAB;
                if(search.deisplayHotel) return $scope.HOTELS_TAB;

                return $scope.HOTELS_TAB;
            })($location.search());
            // JFYI !!+val does the following magic: convert val into integer (+val) and then convert to boolean (!!)
            $scope.asMap = !!+DynamicPackagesCacheWizard.require(AS_MAP_CACHE_KEY);

            $scope.showLanding = true;
            $scope.baloon = aviaHelper.baloon;
            $scope.baloon.showWithClose('Подбор комбинаций', 'Подождите, пожалуйста', balloonCloser);

            /*Methods*/
            $scope.filteredHotels = function(filters){
                var hotelsToShow =  _.filter($scope.hotels, function(hotel){
                    var show = true;

                    $.each(filters, function(filter, value){
                        show = show && doesHotelFit(hotel, filter, value);

                        return show;
                    });

                    return show;
                });

                return hotelsToShow;
            }

            $scope.getHotelDetails = function(hotel){
                DynamicPackagesDataProvider.hotelDetails(
                    hotel.HotelId, hotel.ProviderId,
                    $scope.combination.AviaInfo.VariantId1, $scope.combination.AviaInfo.VariantId2,
                    cacheKey, function(resp){
                        console.log('HOTEL DETAILS', resp);
                    });
            };

            $scope.getTicketDetails = function(ticket){
                $scope.$broadcast(Events.DYNAMIC_SERP_TICKET_DETAILED_REQUESTED, ticket);
            };

            $scope.changeHotelsView = function(){
                $scope.asMap = !$scope.asMap;
            };

            $scope.setHotel = function(hotel){
                updateCombination({Hotel: hotel});
            };

            $scope.setTicket = function(ticket){
                updateCombination({Ticket: ticket});
            }

            $scope.goReservation = function(){
                $location.path(Urls.URL_DYNAMIC_PACKAGES_RESERVATION + [
                    $routeParams.DepartureId,
                    $routeParams.ArrivalId,
                    $routeParams.StartVoyageDate,
                    $routeParams.EndVoyageDate,
                    $routeParams.TicketClass,
                    $routeParams.Adult,
                    $routeParams.Children
                ].join('-'));
            };

            /*EventListener*/
            DynamicFormSubmitListener.listen();

            $scope.$on(Events.DYNAMIC_SERP_FILTER_HOTEL, function(event, data){
                $scope.hotelFilters[data.filter] = data.value;

                $scope.$broadcast(Events.DYNAMIC_SERP_FILTER_ANY_CHANGE, {
                    type: 'hotel',
                    filters: angular.copy($scope.hotelFilters)
                });
            });

            $scope.$on(Events.DYNAMIC_SERP_FILTER_TICKET, function(event, data){
                $scope.ticketFilters[data.filter] = data.value;

                $scope.tickets.filter($scope.ticketFilters)

                $scope.$broadcast(Events.DYNAMIC_SERP_FILTER_ANY_CHANGE, {
                    type: 'ticket',
                    filters: angular.copy($scope.ticketFilters)
                });
            });

            $scope.$on(Events.DYNAMIC_SERP_FILTER_ANY_DROP, function(event, data){
                var eventNameComponent = _.map(data.filter.split('.'), function(component, i){ return i == 0 ? component : '*'; }).join('.');
                $scope.$broadcast(Events.build(Events.DYNAMIC_SERP_FILTER_ANY_DROP, eventNameComponent), data.filter);
            });

            $scope.$on(Events.DYNAMIC_SERP_TICKET_SET_CURRENT_BY_IDS, function(event, data) {
                var ticket = $scope.tickets.search(data.id2, data.id2);

                $scope.setTicket(ticket);
            });

            $scope.$watch('show', function(newVal, oldVal){
                if($scope.combination) loadTab();
            });

            $scope.$watch('asMap', function(newVal) {
                DynamicPackagesCacheWizard.put(AS_MAP_CACHE_KEY, +newVal);
            });

            /*Initial Data fetching*/
            (function() {
                searchParams.StartVoyageDate = dateHelper.ddmmyyyy2yyyymmdd(searchParams.StartVoyageDate);
                searchParams.EndVoyageDate = dateHelper.ddmmyyyy2yyyymmdd(searchParams.EndVoyageDate);
                searchParams.Children && (searchParams.ChildrenAges = searchParams.Children.split('_'));

                if($location.search().hotel) searchParams['HotelId'] = $location.search().hotel;
                if($location.search().ticket) searchParams['TicketId'] = $location.search().ticket;

                DynamicPackagesDataProvider.search(searchParams, function(data){
                    if(!data.RecommendedPair) {
                        $scope.$apply(function($scope){
                            $scope.baloon.showErr(
                                "Не удалось найти ни одной подходящей комбинации",
                                "Попробуйте изменить параметры поиска",
                                balloonCloser
                            );
                        });

                        return;
                    }

                    cacheKey = data.SearchId;

                    $scope.$apply(function($scope){
                        updateCombination({
                            Hotel: data.RecommendedPair.Hotel,
                            AviaInfo: data.RecommendedPair.AviaInfo
                        });

                        $scope.showLanding = false;
                        $scope.baloon.hide();
                    });

                    loadTab(function(){
                        if($location.search().displayTicket) {
                            try{
                                var ticketIds = $location.search().displayTicket.split('_');
                                var ticket = searchTicket(ticketIds[0], ticketIds[1]);

                                if(ticket) {
                                    $scope.getTicketDetails(ticket);
                                } else throw 1;
                            } catch(e) {
                                $scope.baloon.showErr(
                                    "Запрашиваемая билетная пара не найдена",
                                    "Вероятно, она уже продана. Однако у нас есть множество других вариантов перелетов! Смотрите сами!",
                                    angular.noop
                                );
                            }
                        }
                    });
                });
            })();
        }
    ])
    .controller('DynamicPackageSERPTicketPopupCtrl', [
        '$scope', '$element', '$location', 'innaApp.API.events', 'aviaHelper',
        function($scope, $element, $location, Events, aviaHelper){
            /*DOM dirty hacks*/
            $(function(){
                $(document.body).append($element);
            });

            /*Scope Properties*/
            $scope.ticket = null;

            /*Scope Methods*/
            $scope.closePopup = function(){
                //drop ?displayTicket = ...
                delete $location.$$search.displayTicket;
                $location.$$compose();

                $scope.ticket = null;
            };

            $scope.setCurrent = function(){
                $scope.$emit(Events.DYNAMIC_SERP_TICKET_SET_CURRENT_BY_IDS, {
                    id1: $scope.ticket.data.VariantId1,
                    id2: $scope.ticket.data.VariantId2
                });

                $scope.closePopup();
            };

            $scope.airLogo = aviaHelper.setEtapsTransporterCodeUrl;
            $scope.dateHelper = dateHelper;

            /*Listeners*/
            $scope.$on(Events.DYNAMIC_SERP_TICKET_DETAILED_REQUESTED, function(event, ticket){
                console.log(Events.DYNAMIC_SERP_TICKET_DETAILED_REQUESTED, ticket);

                $scope.ticket = ticket;

                $location.search('displayTicket', [$scope.ticket.data.VariantId1, $scope.ticket.data.VariantId2].join('_'));
            });
        }
    ]);