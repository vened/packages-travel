angular.module('innaApp.directives')
    .directive('innaDynamicBundle', ['$templateCache', function($templateCache){        
        return {
            template: $templateCache.get('components/bundle/templ/bundle.html'),
            scope: {
                bundle: '=innaDynamicBundleBundle',
                state: '=innaDynamicBundleState',
                __getTicketDetails: '=innaDynamicBundleTicketDetails',
                __getHotelDetails: '=innaDynamicBundleHotelDetails',
                withReservationButton: '@innaDynamicBundleWithReservationButton',
                close: '=innaDynamicBundleClose'
            },
            controller: [
                '$scope',
                'aviaHelper',
                '$element',
                'innaApp.API.events',
                function($scope, aviaHelper, $element, Events){

                    /*$scope.$on(Events.DYNAMIC_SERP_CHOOSE_HOTEL, function (evt, data) {
                        console.log('Events.DYNAMIC_SERP_CHOOSE_HOTEL = bundle');
                    });*/

                    var infoPopupElems = $('.icon-price-info, .tooltip-price', $element);

                    $scope.infoPopup = new inna.Models.Aux.AttachedPopup(angular.noop, infoPopupElems, $scope);

                    var linkPopupsElems = $('.share-button, .tooltip-share-link', $element);

                    $scope.linkPopup = new inna.Models.Aux.AttachedPopup(angular.noop, linkPopupsElems, $scope);

                    $scope.$watch('linkPopup.isOpen', function(){
                        $scope.location = document.location;
                    });

                    $scope.location = document.location;

                    /*Proxy*/
                    $scope.dateHelper = dateHelper;

                    $scope.airLogo = aviaHelper.setEtapsTransporterCodeUrl;

                    $scope.getTicketDetails = function($event, ticket){
                        $event.stopPropagation();

                        return $scope.__getTicketDetails(ticket);
                    }

                    $scope.getHotelDetails = function($event, hotel){
                        $event.stopPropagation();

                        return $scope.__getHotelDetails(hotel);
                    }
                }
            ]
        }
    }]);