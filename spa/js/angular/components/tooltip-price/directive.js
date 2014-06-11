angular.module('innaApp.directives')
    .directive('toolTipPrice', ['$templateCache', function($templateCache){
        return {
            template: $templateCache.get('components/tooltip-price/templ/index.html'),
            scope: {
                "item" : "=item",
                "icon" : "=iconWhite",
                "isHotel" : "=isHotel",
                "isTicket" : "=isTicket",
                "isBundle" : "=isBundle"
            },
            controller: [
                '$scope',
                '$element',
                function($scope, $element){

                    if($scope.item.hotel.data.PriceObject != 'undefined'){
                        $scope.isPriceObject = true;
                    }

                    if($scope.isHotel){
                        $scope.item.PriceObject = $scope.item.hotel.data.PriceObject;
                        hotelDataPrice = $scope.item.ticket.data.PriceObject;
                    }

                    if($scope.isTicket){
                        $scope.item.PriceObject = $scope.item.ticket.data.PriceObject;
                        ticketDataPrice = $scope.item.ticket.data.PriceObject;
                    }

                    if($scope.isBundle){
                        console.log($scope.item.getFullTotalPrice());
                        $scope.item.PriceObject = $scope.item.getFullTotalPrice();
                    }


                    var isVisible = false;


                    var getIsVisible = function () {
                        return isVisible;
                    }

                    var setIsVisible = function (data) {
                        isVisible = data;
                    }

                    var showToolTip = function (evt) {
                        evt.stopPropagation();

                        var tooltip = $element.find('.JS-tooltip-price');

                        $(document).on('tooltip:hide', function () {
                            setIsVisible(false);
                            tooltip.hide();
                        });

                        $(document).trigger('tooltip:hide');

                        if (!getIsVisible()) {
                            tooltip.show();
                            setIsVisible(true);
                        }
                        else {
                            tooltip.hide();
                            setIsVisible(false);
                        }

                        $(document).on('click', function bodyClick() {
                            tooltip.hide();
                            setIsVisible(false);
                            $(document).off('click', bodyClick);
                        });
                    };

                    $element.on('click', '.js-show-tooltip', showToolTip);
                }
            ]
        }
    }]);