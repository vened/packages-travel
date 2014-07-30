angular.module('innaApp.controllers')
    .controller('B2B_DisplayOrder', [
        '$scope',
        '$routeParams',
        'DynamicPackagesDataProvider',
        'innaApp.API.events',
        '$location',
        function($scope, $routeParams, DynamicPackagesDataProvider, Events, $location){
            $scope.bundle = null;
            $scope.hotel = null;
            $scope.back = null;

            $scope.displayTicket = ('displayTicket' in $location.search());

            /*Methods*/
            $scope.getTicketDetails = function(){
                $scope.$broadcast(Events.DYNAMIC_SERP_TICKET_DETAILED_REQUESTED, $scope.bundle.ticket);
            };

            /*Initial*/
            $scope.baloon.show('Собираем данные', 'Это может занять какое-то время');

            DynamicPackagesDataProvider.displayOrder($routeParams.OrderId, function(resp){ //success
                $scope.baloon.hide();

                $scope.bundle = new inna.Models.Dynamic.Combination();
                $scope.bundle.ticket = new inna.Models.Avia.Ticket();
                $scope.bundle.ticket.setData(resp.AviaInfo);

                if(resp.Hotel) {
                    $scope.hotel = $scope.bundle.hotel = new inna.Models.Hotels.Hotel(resp.Hotel);

                    $scope.bundle.hotel.detailed = {
                        Hotel: resp.Hotel,
                        Rooms: [resp.Hotel.Room]
                    };

                    if($scope.bundle.hotel.detailed) {
                        $scope.bundle.hotel.detailed.Rooms[0].isOpen = true;
                    }
                }

                $scope.$broadcast(Events.DYNAMIC_SERP_HOTEL_DETAILS_LOADED);

                if($scope.displayTicket) {
                    $scope.getTicketDetails();
                }

                try {
                    $scope.$digest();
                } catch(e) {}
            }, function(){ //error
                $scope.baloon.showErr('Oops...', 'Указанного заказа не существует');
            });
        }
    ]);