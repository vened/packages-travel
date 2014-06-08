angular.module('innaApp.directives')
    .directive('innaHotel', [
        '$templateCache',
        '$timeout',
        function ($templateCache, $timeout) {
            return {
                template: $templateCache.get('components/hotel/templ/index.html'),
                //templateUrl: '/spa/js/angular/components/hotel/templ/index.html',
                scope: false,
                transclude: true,

                controller: [
                    '$scope',
                    '$element',
                    function ($scope, $element) {
                      console.log($scope.hotel.data);
                        $scope.goToMap = function(){
                            $scope.$emit('hotel:go-to-map', $scope.hotel);
                        }

                        $scope.setCurrent = function(){
                            $scope.$emit('choose:hotel', $scope.hotel);
                        }

                        $scope.virtualBundle = new inna.Models.Dynamic.Combination();
                        $scope.virtualBundle.hotel = $scope.hotel;
                        $scope.virtualBundle.ticket = $scope.combination.ticket;

                        //console.log($scope.virtualBundle);



                       $element.on('click', '.js-hotel-item-details', function(evt){
                         $scope.$emit('more:detail:hotel', $scope.hotel);
                       });

                    }],
                link : function($scope, $element){

                  $scope.$watch('hotel.currentlyInvisible', function(isInvis){
                        if(!isInvis && $element.find('.b-carousel').length) {
                            $timeout(function(){

                                $element.find('.b-carousel').innaCarousel({
                                    photoList: $scope.hotel.data.Photos,
                                    size: 'Small',
                                    style: {
                                        width: 200,
                                        height: 190
                                    }
                                });

                            }, 1);
                        }
                    });
                }
            }
    }]);