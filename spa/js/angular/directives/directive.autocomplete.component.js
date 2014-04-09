﻿innaAppDirectives.directive('dropdownInput', ['eventsHelper', function (eventsHelper) {
    return {
        templateUrl: '/spa/templates/components/dropdown_input.html',
        scope: {
            provideSuggestCallback: '=', //callback for ngChange
            suggest: '=', //list of suggested objects
            result: '=',
            theme: '@',
            askForData: '='
        },
        controller: ['$scope', function($scope){
            /*Properties*/
            $scope.fulfilled = false;
            /*Events*/
            $scope.setCurrent = function ($event, option, airport) {
                //запрещаем баблинг
                $event && eventsHelper.preventBubbling($event);

                if (option != null) {
                    if (airport != null) {
                        $scope.input.val(airport.Name);
                        $scope.result = airport.Id;
                    }
                    else {
                        $scope.input.val(option.Name);
                        $scope.result = option.Id;
                    }
                }
                $scope.fulfilled = true;
            }
            $scope.unfulfill = function(){
                $scope.fulfilled = false;
                $scope.result = null;
            }

            /*Watchers*/
            $scope.$watch('result', function(newValue, oldValue){
                if(newValue instanceof Error) {
                    $scope.result = oldValue;

                    $scope.input.tooltip('enable');
                    $scope.input.tooltip('open');
                } else if(!$scope.input.val()) {
                    if(newValue != null && newValue != 'null' && $scope.askForData) {
                        $scope.askForData(newValue, function (data) {
                            $scope.setCurrent(null, data);
                        });
                    }
                }
            });
        }],
        link: function(scope, elem, attrs){
            scope.input = $('input[type="text"]', elem);

            /*Events*/
            scope.input.keyup(function(event){
                var value = scope.input.val();
                var preparedText = value.split(', ')[0].trim();

                if(preparedText.length) {
                    scope.provideSuggestCallback(preparedText, value);
                }
            });

            scope.input.focus(function(){
                scope.$apply(function($scope){
                    $scope.fulfilled = false;
                });

                scope.input.tooltip('disable');
            });

            $(document).click(function(event){
                var isInsideComponent = !!$(event.target).closest(elem).length;

                if(!isInsideComponent) {
                    scope.fulfilled = true;
                    //select all
                    $(event.target).select();
                }
            });

            /*Tooltip*/
            scope.input.tooltip({
                position: {
                    my: 'center top+22',
                    at: 'center bottom'
                }
            });

            scope.input.tooltip('disable');
        }
    }
}]);