angular.module('innaApp.components').
    factory('Tripadvisor', [
        '$filter',
        '$templateCache',
        function ($filter, $templateCache) {

            var Tripadvisor = Ractive.extend({
                template: $templateCache.get('components/tripadvisor/templ/ta.hbs.html'),
                append: true,
                data: {
                    withOutTd: false,
                    TaFactorArr: []
                },
                onrender: function () {
                    var that = this;

                    this.on({
                        change: function (data) {

                        },
                        teardown: function (evt) {

                        }
                    })

                    this.observe('TaFactor', function (newValue, oldValue, keypath) {
                        if (newValue) {
                            this.set({TaFactorArr: this.parse(this.get('TaFactor'))})
                        }
                    });
                },

                /**
                 * Создаем массив для шаблона
                 * @param end
                 * @returns {Array}
                 */
                parse: function (end) {
                    var list = [];
                    var isFloat = $filter('isFloat')(end);

                    for (var i = 0; i < 5; ++i) {
                        list.push({
                            value: null,
                            active: false,
                            isFloat: false
                        })
                    }

                    list.every(function (item, index) {
                        //console.log((index + 1) <= end, (index + 1) , end, isFloat );
                        if ((index + 1) <= end) {
                            item.active = true;
                            item.value = end;
                        } else {
                            if (isFloat) {
                                item.isFloat = true;
                            }
                            return false;
                        }
                        return true;
                    })

                    return list;
                }

            });

            return Tripadvisor;
        }])
    .directive('tripAdvisorDirective', [
        '$templateCache',
        '$filter',
        'Tripadvisor',
        function ($templateCache, $filter, Tripadvisor) {
            return {
                replace: true,
                template: '',
                scope: {
                    hotelData: '=',
                    templ: "@"
                },
                link: function ($scope, $element, $attr) {

                    function getTempl(){
                        var t = 'ta.hbs.html'
                        if($scope.templ) t = $scope.templ;
                        return $templateCache.get('components/tripadvisor/templ/'+t);
                    }

                    var _tripadvisor = new Tripadvisor({
                        el: $element[0],
                        template: getTempl()
                    });

                    $scope.$watch('hotelData', function (value) {
                        if (value) {
                            _tripadvisor.set({
                                TaCommentCount: $scope.hotelData.TaCommentCount,
                                TaFactor: $scope.hotelData.TaFactor,
                                TaFactorCeiled: $scope.hotelData.TaFactorCeiled
                            });
                        }
                    })


                    $scope.$on('$destroy', function () {
                        _tripadvisor.teardown();
                        _tripadvisor = null;
                    })
                }
            }
        }])
