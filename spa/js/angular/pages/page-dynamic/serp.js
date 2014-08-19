innaAppControllers
    .controller('PageDynamicPackage', [
        'EventManager',
        '$scope',
        'DynamicFormSubmitListener',
        'DynamicPackagesDataProvider',
        '$routeParams',
        'innaApp.API.events',
        '$location',
        'innaApp.Urls',
        'aviaHelper',

        // components

        '$templateCache',
        'Balloon',
        'ListPanel',
        'FilterPanel',
        function (EventManager, $scope, DynamicFormSubmitListener, DynamicPackagesDataProvider, $routeParams, Events, $location, Urls, aviaHelper, $templateCache, Balloon, ListPanel, FilterPanel) {

            /*Private*/

            /**
             * Преобразуем даты и собираем данные для запроса
             * StartVoyageDate и EndVoyageDate
             * Так как в url не можем сразу передавать дату формата 2014-10-22
             * знак дефис служебный для angular
             */

            var routParam = angular.copy($routeParams);
            var searchParams = angular.extend(routParam, {
                StartVoyageDate: dateHelper.ddmmyyyy2yyyymmdd(routParam.StartVoyageDate),
                EndVoyageDate: dateHelper.ddmmyyyy2yyyymmdd(routParam.EndVoyageDate),
                HotelId: $location.search().hotel,
                TicketId: $location.search().ticket,
                ChildrenAges: (routParam.Children) ? routParam.Children.split('_') : null
            });

            var cacheKey = '';
            var serpScope = $scope;
            $scope.hotelsRaw = null;
            $scope.hotelsForMap = null;
            var MAX_HOTEL_LEN = 180;
            $scope.padding = true;

            /*Properties*/
            var ListPanelComponent = null;
            var FilterPanelComponent = null;
            $scope.hotels = new inna.Models.Hotels.HotelsCollection();
            $scope.airports = null;
            $scope.hotelFilters = new inna.Models.Avia.Filters.FilterSet();
            $scope.tickets = new inna.Models.Avia.TicketCollection();
            $scope.ticketFilters = new inna.Models.Avia.Filters.FilterSet();
            $scope.combination = new inna.Models.Dynamic.Combination();

            $scope.state = new function () {
                this.HOTELS_TAB = null;
                this.TICKETS_TAB = null;
                this.HOTEL = 'hotel';
                this.TICKET = 'ticket';

                this.HOTELS_TAB = true;

                if ($location.search().displayTicket) {
                    this.TICKETS_TAB = true;
                    this.HOTELS_TAB = false;
                }
                if ($location.search().displayHotel) {
                    this.HOTELS_TAB = true;
                    this.TICKETS_TAB = false;
                }

                this.switchTo = function (tabName) {
                    if (tabName == 'ticket') {
                        this.TICKETS_TAB = true;
                        this.HOTELS_TAB = false;
                    } else if (tabName == 'hotel') {
                        this.HOTELS_TAB = true;
                        this.TICKETS_TAB = false;
                    }

                    return loadTab();
                };

                this.isActive = function (tabName) {
                    return tabName;
                };
            };

            $scope.showLanding = true;


            $scope.passengerCount = 0;

            /*Simple proxy*/
            $scope.airLogo = aviaHelper.setEtapsTransporterCodeUrl;
            $scope.dateHelper = dateHelper;
            $scope.events = Events;


            // TODO : Hotel.prototype.setCurrent method is deprecated
            // Use event choose:hotel = Events.DYNAMIC_SERP_CHOOSE_HOTEL
            inna.Models.Hotels.Hotel.prototype.setCurrent = function () {
                $scope.combination.hotel = this;
                $location.search('hotel', this.data.HotelId);
            };

            EventManager.on(Events.DYNAMIC_SERP_CHOOSE_HOTEL, function (data) {
                $scope.safeApply(function () {
                    $scope.combination.hotel = data;
                    $location.search('hotel', data.data.HotelId);
                });
            });

            EventManager.on(Events.DYNAMIC_SERP_CHOOSE_TICKET, function (data) {
                $scope.safeApply(function () {
                    $scope.combination.ticket = data;
                    $location.search('ticket', data.data.VariantId1);
                });
            });


            /**
             * переход со списка на карту
             * срабатывает также когда переходим с карточки отеля
             */
            EventManager.on(Events.DYNAMIC_SERP_TOGGLE_MAP, function (data, single_hotel) {
                $scope.safeApply(function () {
                    setAsMap((getAsMap()) ? 0 : 1);
                    locatioAsMap();
                    $scope.hotelsForMap = data

                    if (single_hotel) {
                        setTimeout(function () {
                            // прокидываем данные в карту
                            $scope.$broadcast(Events.DYNAMIC_SERP_TOGGLE_MAP_SINGLE, single_hotel);
                        }, 1000);
                    }

                });
            });

            // случаем событие переключения контрола с карты на список и обратно
            EventManager.on(Events.DYNAMIC_SERP_BACK_TO_MAP, function (data) {
                $scope.safeApply(function () {
                    setAsMap((getAsMap()) ? 0 : 1);
                    locatioAsMap();
                })
            });




            /**
             * Изменяем класс у results-container
             */
            function changePadding(data) {
                $scope.safeApply(function () {
                    $scope.padding = data;
                });
            }

            /**
             * События открытия закрытия - рекомендованного варианта
             */
            EventManager.on(Events.DYNAMIC_SERP_CLOSE_BUNDLE, changePadding);
            EventManager.on(Events.DYNAMIC_SERP_OPEN_BUNDLE, changePadding);


            EventManager.on(Events.DYNAMIC_SERP_LOAD_TAB, function (data_tab) {
                $scope.safeApply(function () {
                    $scope.state.switchTo(data_tab)
                });
            })

            EventManager.on(Events.MAP_CLOSE, function (data_tab) {
                setAsMap(0);
                locatioAsMap();
            })

            function loadTab() {
                if ($scope.state.isActive($scope.state.HOTELS_TAB))
                    return loadHotels();
                else if ($scope.state.isActive($scope.state.TICKETS_TAB))
                    return loadTickets();
            }

            /**
             * Загрузка списка отелей
             * Инициализирует компонент @link ListPanelComponent
             * @returns {jQuery.Deferred}
             */
            function loadHotels() {
                console.log('Get Hotels');

                var param = $scope.combination.ticket.data.VariantId1;
                var routeParams = angular.copy(searchParams);
                var deferred = new $.Deferred();

                if (!param) return;

                if (ListPanelComponent) ListPanelComponent.wait();

                DynamicPackagesDataProvider
                    .getHotelsByCombination(param, routeParams, function (data) {

                        // удаляем существующий объект ListPanelComponent
                        if (ListPanelComponent) {
                            ListPanelComponent.teardown();
                            ListPanelComponent = null;
                        }

                        /** Если пришли даннные по отелям */
                        if (data.Hotels) {

                            console.log(data.Filters, 'data.filters');
                            /** переключаем фильтры или создаем панель */
                            if (!FilterPanelComponent) {
                                FilterPanelComponent = new FilterPanel({
                                    el: document.querySelector('.recommend-bundle-container'),
                                    data: {
                                        combinationModel: $scope.combination,
                                        filtersData : data.Filters
                                    }
                                })
                            } else {
                                FilterPanelComponent.toggleFilters(data.Filters);
                            }

                            ListPanelComponent = new ListPanel({
                                el: document.querySelector('.results-container_list'),
                                data: {
                                    iterable_hotels: true,
                                    Enumerable: data.Hotels,
                                    combinationModel: $scope.combination
                                }
                            });
                        }

                        $scope.safeApply(function () {
                            $scope.hotels.flush();
                            $scope.hotelsRaw = data;

                            for (var i = 0, raw = null; raw = data.Hotels[i++];) {
                                if (!raw.HotelName) continue;
                                var hotel = new inna.Models.Hotels.Hotel(raw);
                                hotel.hidden = false;
                                hotel.data.hidden = false;
                                hotel.currentlyInvisible = false;
                                $scope.hotels.push(hotel);
                            }

                            $scope.$broadcast('Dynamic.SERP.Tab.Loaded');
                            $scope.baloon.hide();
                            deferred.resolve();
                        })
                    });

                return deferred;
            }

            /**
             * Загрузка списка авиа билетов
             * Инициализирует компонент @link ListPanelComponent
             * @returns {jQuery.Deferred}
             */
            function loadTickets() {
                console.log('Get Tickets');

                var param = $scope.combination.hotel.data.HotelId;
                var routeParams = angular.copy(searchParams);
                var deferred = new $.Deferred();

                if (!param) return;

                // TODO : заглушка
                // позже будет прелоадер
                if (ListPanelComponent) ListPanelComponent.wait();

                DynamicPackagesDataProvider
                    .getTicketsByCombination(param, routeParams, function (data) {

                        // удаляем существующий объект ListPanelComponent
                        if (ListPanelComponent) {
                            ListPanelComponent.teardown();
                            ListPanelComponent = null;
                        }


                        /** Если пришли даннные по отелям */
                        if (data.AviaInfos) {

                            if (!FilterPanelComponent) {
                                FilterPanelComponent = new FilterPanel({
                                    el: document.querySelector('.recommend-bundle-container'),
                                    data: {
                                        combinationModel: $scope.combination,
                                        filtersData : data.Filters,
                                        filter_hotel: false,
                                        filter_avia: true
                                    }
                                })
                            } else {
                                FilterPanelComponent.toggleFilters(data.Filters);
                            }


                            ListPanelComponent = new ListPanel({
                                el: document.querySelector('.results-container_list'),
                                data: {
                                    iterable_tickets: true,
                                    Enumerable: data.AviaInfos,
                                    combinationModel: $scope.combination
                                }
                            });
                        }

                        $scope.safeApply(function () {
                            $scope.tickets.flush();

                            for (var i = 0, raw = null; raw = data.AviaInfos[i++];) {
                                var ticket = new inna.Models.Avia.Ticket();
                                ticket.setData(raw);
                                $scope.tickets.push(ticket);
                            }
                            deferred.resolve();
                        })
                    });

                return deferred;
            }

            function combination404() {
                //аналитика
                track.noResultsDp();
                $scope.baloon.showNotFound(balloonCloser);
            }

            function combination500() {
                $scope.$apply(function ($scope) {
                    $scope.baloon.showErr(
                        "Что-то пошло не так",
                        "Попробуйте начать поиск заново",
                        balloonCloser
                    );
                });
            }

            function ticket404() {
                $scope.baloon.showErr(
                    "Запрашиваемая билетная пара не найдена",
                    "Вероятно, она уже продана. Однако у нас есть множество других вариантов перелетов! Смотрите сами!",
                    function () {
                        delete $location.$$search.displayTicket
                        $location.$$compose();
                    }
                );
            }

            function balloonCloser() {
                $location.search({});
                $location.path(Urls.URL_DYNAMIC_PACKAGES);
            }

            function combination200(data) {
                var onTabLoad = angular.noop;
                var onTabLoadParam;
                var defaultTab = $scope.state.HOTEL;

                if (!data || !data.RecommendedPair) return $scope.$apply(combination404);

                //аналитика
                var trackKey = $location.url();
                if (track.isTrackSuccessResultAllowed(track.dpKey, trackKey)) {
                    track.successResultsDp(track.dpKey);
                    //console.log('analitics: dp success result');
                    track.denyTrackSuccessResult(track.dpKey, trackKey);
                }

                $scope.airports = data.Airports || [];
                cacheKey = data.SearchId;

                $scope.$apply(function ($scope) {
                    $scope.combination.ticket = new inna.Models.Avia.Ticket();
                    $scope.combination.ticket.setData(data.RecommendedPair.AviaInfo);
                    $scope.combination.hotel = new inna.Models.Hotels.Hotel(data.RecommendedPair.Hotel);
                    $scope.showLanding = false;
                });

                if ($location.search().displayTicket || $location.search().display == 'tickets') {
                    onTabLoad = loadTicketDetails;
                    onTabLoadParam = $location.search().displayTicket;
                    defaultTab = $scope.state.TICKET;
                } else if ($location.search().displayHotel) {
                    onTabLoad = loadHotelDetails;
                    onTabLoadParam = $location.search().displayHotel;
                    defaultTab = $scope.state.HOTEL;
                }


                $scope.$apply(function ($scope) {
                    $.when($scope.state.switchTo(defaultTab))
                        .then(function () {
                            onTabLoad(onTabLoadParam);
                            $scope.baloon.hide();
                        });
                });
            }

            function loadTicketDetails(ids) {
                if(!ids) return;

                try {
                    var ticketIds = ids.split('_');
                    var ticket = $scope.tickets.search(ticketIds[0], ticketIds[1]);
                    if (ticket) {
                        $scope.getTicketDetails(ticket);
                    } else throw false;
                } catch (e) {
                    ticket404();
                }
            }

            function loadHotelDetails() {

            }


            $scope.getTicketDetails = function (ticket) {
                EventManager.fire(Events.DYNAMIC_SERP_TICKET_DETAILED_REQUESTED, ticket);
            };

            $scope.loadHotelDetails = function (ticket) {
                //EventManager.fire(Events.DYNAMIC_SERP_TICKET_DETAILED_REQUESTED, ticket);
            };


            $scope.goMap = function () {
                $scope.$emit('toggle:view:hotels:map');
            }

            /*EventListener*/
            DynamicFormSubmitListener.listen();


            function getAsMap() {
                return $scope.asMap;
            }

            function setAsMap(param) {
                $scope.asMap = param;
            }

            function closeMap() {
                setAsMap(0);
                delete $location.$$search.map;
                $location.$$compose();
            }

            function locatioAsMap() {
                if (!getAsMap()) {
                    closeMap();
                } else {
                    $location.search('map', 'show');
                }
            }


            // прямая ссылка на карту
            setAsMap(($location.$$search.map) ? 1 : 0);


            // переход с карты на список по кнопке НАЗАД в браузере
            // работает тольео в одну сторону - назад
            $scope.$on('$locationChangeSuccess', function (data, url, datatest) {
                setAsMap(($location.search().map) ? 1 : 0);
            });

            /*Initial Data fetching*/
            (function () {
                $scope.baloon.showWithCancel('Ищем варианты', 'Поиск займет не более 30 секунд', balloonCloser);
                $scope.passengerCount = parseInt(searchParams.Adult) + (searchParams.ChildrenAges ? searchParams.ChildrenAges.length : 0);
                DynamicPackagesDataProvider.search(searchParams, combination200, combination500);
            }());


            $scope.$on('$destroy', function () {
                console.log('$destroy serp');
                EventManager.off(Events.DYNAMIC_SERP_BACK_TO_MAP);
                EventManager.off(Events.DYNAMIC_SERP_CHOOSE_HOTEL);
                EventManager.off(Events.DYNAMIC_SERP_CHOOSE_TICKET);
                EventManager.off(Events.DYNAMIC_SERP_TOGGLE_MAP);
                EventManager.off(Events.DYNAMIC_SERP_CLOSE_BUNDLE, changePadding);
                EventManager.off(Events.DYNAMIC_SERP_OPEN_BUNDLE, changePadding);

                if (ListPanelComponent) {
                    ListPanelComponent.teardown();
                    ListPanelComponent = null;
                }

                if (FilterPanelComponent) {
                    FilterPanelComponent.teardown();
                    FilterPanelComponent = null;
                }

                $(document).off('scroll');
            })
        }
    ]);