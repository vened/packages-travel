innaAppConponents.controller("WhereToBuyCtrl", function ($rootScope, $scope, $timeout, innaAppApiEvents, EventManager, whereToBuyService) {

    EventManager.fire(innaAppApiEvents.FOOTER_HIDDEN);
    $rootScope.BodyStyleGlobal = {'background-color': '#fff'};


    /**
     * позиционируем контейнер для карты
     */
    var topMap = document.querySelector('.js-b-where-to-buy-map__container');
    $scope.offsetTop = {top: topMap.offsetTop, bottom: 0};
    var body = document.querySelector('body');
    $scope.listHeight = {height: body.clientHeight - topMap.offsetTop - 310};
    $scope.promoPositions = {top: (body.clientHeight - topMap.offsetTop)/2}

    /**
     * json заглушка
     */
    var locations = [];
    for (var i = 0; i < 100; i++) {
        var long = Math.random() * (56 - 55.5) + 55.5;
        var lang = Math.random() * (37.9 - 37.3) + 37.3;
        locations.push(
            {
                Coordinate: long + ',' + lang,
                Name: 'АЛЬФА' + i,
                Address: '125581, г. Москва, ул. Лавочкина, д.32, ДС «Динамо», офис 213-1',
                Phone: '7(495)7247210',
                Site: 'mail.com'
            }
        )
    }


    ymaps.ready(initMap);

    function initMap() {

        var mapContainer = document.querySelector('.b-where-to-buy-map');
        var iconDefault = {
            iconLayout: 'default#image',
            iconImageHref: 'spa/img/map/pin-grey.png?',
            iconImageSize: [21, 32],
            iconImageOffset: [0, 0]
        };
        var iconHover = {
            iconLayout: 'default#image',
            iconImageHref: 'spa/img/map/pin-black.png?',
            iconImageSize: [21, 32],
            iconImageOffset: [0, 0]
        };
        var iconActive = {
            iconLayout: 'default#image',
            iconImageHref: 'spa/img/map/pin-green.png?',
            iconImageSize: [21, 32],
            iconImageOffset: [0, 0]
        };

        var myMap = new ymaps.Map(mapContainer, {
            center: [55.75396, 37.620393],
            zoom: 10,
            controls: []
        });


        var setMapCentered = function (city) {
            ymaps.geocode(city).then(
                function (res) {
                    var coord = res.geoObjects.get(0).geometry.getCoordinates();
                    myMap.setCenter(coord, 10);
                }
            );
        };
        
        
        /**
         * автоматически оперделяем текущую локацию и показываем карту с метками для нее
         */
        $scope.setCurrentLocation = function(location){
            $scope.editLocation = false;
            if(location){
                    $scope.currentCity = location.name;
                    setMapCentered(location.name);
            }else{
                whereToBuyService.getCurrentLocation().then(function (data) {
                    $scope.currentCity = data;
                    setMapCentered(data);
                });
            }
        };
        $scope.setCurrentLocation();


        /**
         * поиск локали откуда для авиа и ДП одно и то же
         */
        $scope.getLocationFrom = function (text) {
            return whereToBuyService.getLocation(text)
                .then(function (data) {
                    return data;
                });
        };


        /**
         * загрузка списка агенств
         */
        whereToBuyService.getAgencyList().success(function (data) {
            $scope.agencies = data.concat(locations);
            if ($scope.agencies){
                setMarkers($scope.agencies, $scope.currentAgencyId);
            }else{
                $scope.showPromo = true; 
            }
        });


        $scope.currentAgencyId = 1;
        $scope.arrayMarkers = [];

        $scope.setAgency = function (index) {
            if(index){
                $scope.currentAgencyId = index;
                $scope.arrayMarkers.forEach(function (marker, i) {
                    marker.options.set(iconDefault);
                });
                $scope.arrayMarkers[index].options.set(iconActive);
            }else{
                $scope.arrayMarkers[$scope.currentAgencyId].options.set(iconActive);
            }
        };

        function setMarkers(markers, currentMarker) {
            markers.forEach(function (marker, i) {

                var coordinate = marker.Coordinate.split(",");

                if (currentMarker != i) {
                    var myPlacemark = new ymaps.Placemark(coordinate, {id: i}, iconDefault);
                } else {
                    var myPlacemark = new ymaps.Placemark(coordinate, {id: i}, iconHover);
                }

                myPlacemark.events
                    .add('mouseenter', function (e) {
                        e.get('target').options.set(iconHover);
                    })
                    .add('mouseleave', function (e) {
                        e.get('target').options.set(iconDefault);
                        var id = e.get('target').properties.get('id');
                        $scope.$apply(function ($scope) {
                            $scope.setAgency();
                        });
                    })
                    .add('mousedown', function (e) {
                        e.get('target').options.set(iconHover);
                        var id = e.get('target').properties.get('id');
                        $scope.$apply(function ($scope) {
                            $scope.setAgency(id);
                        });
                        scrollList(id);
                    });

                $scope.arrayMarkers.push(myPlacemark);

                myMap.geoObjects.add(myPlacemark);

            });
        };

        var list = $(".b-where-to-buy__agencies-list");

        function scrollList(id) {
            var currentItem = document.querySelector(".js-list-item-" + id);
            list.scrollTop(currentItem.offsetTop - 54);
        }

    };
});