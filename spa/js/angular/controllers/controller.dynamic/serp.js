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

                if($scope.state.isActive($scope.state.HOTELS_TAB)) {
                    method = 'getHotelsByCombination';
                    param = $scope.combination.AviaInfo.data.VariantId1;
                    apply = function($scope, data){
                        $scope.hotels.flush();

                        for(var i = 0, raw = null; raw = data.Hotels[i++];) {
                            var hotel = new inna.Models.Hotels.Hotel(raw);

                            $scope.hotels.push(hotel);
                        }
                    };
                } else if($scope.state.isActive($scope.state.TICKETS_TAB)) {
                    method = 'getTicketsByCombination';
                    param = $scope.combination.Hotel.data.HotelId;
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

            function combination404(){
                $scope.baloon.showErr(
                    "Не удалось найти ни одной подходящей комбинации",
                    "Попробуйте изменить параметры поиска",
                    balloonCloser
                );
            }

            function ticket404(){
                $scope.baloon.showErr(
                    "Запрашиваемая билетная пара не найдена",
                    "Вероятно, она уже продана. Однако у нас есть множество других вариантов перелетов! Смотрите сами!",
                    angular.noop
                );
            }

//            doesHotelFit.comparators = {
//                Name: function(hotel, value){
//                    if(!value) return true;
//
//                    return (hotel.HotelName && hotel.HotelName.indexOf(value) !== -1);
//                },
//                Extra: function(hotel, value){
//                    var show = true;
//
//                    for(var option in value) if(value.hasOwnProperty(option)) {
//                        if(!value[option]) continue;
//
//                        show = show && hotel[option];
//                    }
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
                    .search('hotel',$scope.combination.Hotel.data.HotelId)
                    .search('ticket', $scope.combination.AviaInfo.data.VariantId1);

                console.log('updateCombination:', $scope.combination);
            }

            function balloonCloser() {
                $location.search({});
                $location.path(Urls.URL_DYNAMIC_PACKAGES);
            }

            /*Properties*/
            $scope.hotels = new inna.Models.Hotels.HotelsCollection();
            $scope.hotelFilters = new inna.Models.Avia.Filters.FilterSet();
            $scope.tickets = new inna.Models.Avia.TicketCollection();
            $scope.ticketFilters = new inna.Models.Avia.Filters.FilterSet();
            $scope.combination = null;

            $scope.state = (function(){
                var O = function(){
                    this.HOTELS_TAB = '/spa/templates/pages/dynamic/inc/serp.hotels.html';
                    this.TICKETS_TAB = '/spa/templates/pages/dynamic/inc/serp.tickets.html';

                    this.display = this.HOTELS_TAB;

                    if($location.search().displayTicket) this.display = this.TICKETS_TAB;
                    if($location.search().displayHotel) this.display = this.HOTELS_TAB;

                    this.switchTo = function(tabName){
                        this.display = tabName;
                    };

                    this.isActive = function(tabName){
                        return this.display == tabName;
                    };
                };

                return new O();
            })();


            // JFYI !!+val does the following magic: convert val into integer (+val) and then convert to boolean (!!)
            $scope.asMap = !!+DynamicPackagesCacheWizard.require(AS_MAP_CACHE_KEY);

            $scope.showLanding = true;

            $scope.baloon.showWithClose('Подбор комбинаций', 'Подождите, пожалуйста', balloonCloser);

            /*Methods*/
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
            };

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

            $scope.airLogo = aviaHelper.setEtapsTransporterCodeUrl;
            $scope.dateHelper = dateHelper;

            /*EventListener*/
            DynamicFormSubmitListener.listen();

            $scope.$on(Events.DYNAMIC_SERP_FILTER_HOTEL, function(event, data){
                $scope.hotelFilters[data.filter] = data.value;

                $scope.$broadcast(Events.DYNAMIC_SERP_FILTER_ANY_CHANGE, {
                    type: 'hotel',
                    filters: angular.copy($scope.hotelFilters)
                });
            });

            //todo can i do it without listeners?
            $scope.$on(Events.DYNAMIC_SERP_TICKET_SET_CURRENT_BY_IDS, function(event, data) {
                var ticket = $scope.tickets.search(data.id2, data.id2);

                $scope.setTicket(ticket);
            });

            $scope.$watch('state.display', function(newVal, oldVal){
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
                    if(!data || !data.RecommendedPair) return $scope.$apply(combination404);

                    cacheKey = data.SearchId;

                    var recommendedTicket = new inna.Models.Avia.Ticket();
                    recommendedTicket.setData(data.RecommendedPair.AviaInfo);

                    var recommendedHotel = new inna.Models.Hotels.Hotel(data.RecommendedPair.Hotel);

                    $scope.$apply(function($scope){
                        updateCombination({
                            Hotel: recommendedHotel,
                            AviaInfo: recommendedTicket
                        });

                        $scope.showLanding = false;
                        $scope.baloon.hide();
                    });

                    loadTab(function(){
                        if($location.search().displayTicket) {
                            try{
                                var ticketIds = $location.search().displayTicket.split('_');
                                var ticket = $scope.tickets.search(ticketIds[0], ticketIds[1]);

                                if(ticket) {
                                    $scope.getTicketDetails(ticket);
                                } else throw 1;
                            } catch(e) {
                                ticket404();
                            }
                        }
                    });
                }, function(){
                    $scope.$apply(function($scope){
                        $scope.baloon.showErr(
                            "Что-то пошло не так",
                            "Попробуйте начать поиск заново",
                            balloonCloser
                        );
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
    ])
    .controller('DynamicPackageSERPRecommendedBundleCtrl', [
        '$scope',
        function($scope){
            $scope.display = {};
            $scope.display.FULL = 1;
            $scope.display.SHORT = 2;
            $scope.display.current = $scope.display.FULL;
            $scope.display.toggle = function(){
                if($scope.display.current == $scope.display.SHORT) {
                    $scope.display.current = $scope.display.FULL;
                } else {
                    $scope.display.current = $scope.display.SHORT;
                }
            };

            $scope.display.help = false;
            $scope.display.toggleHelp = function(){
                $scope.display.help = !$scope.display.help;
            }
        }
    ]);