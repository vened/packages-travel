angular.module('innaApp.conponents').
    factory('FilterExtra', [
        'EventManager',
        '$filter',
        '$templateCache',
        '$routeParams',
        'innaApp.API.events',

        'ClassFilter',
        function (EventManager, $filter, $templateCache, $routeParams, Events, ClassFilter) {

            var FilterThis = null;
            var FilterExtra = ClassFilter.extend({
                template: $templateCache.get('components/filter-panel/templ-filters/extra.hbs.html'),
                data: {
                    value: {
                        name: 'Extra',
                        val: [],
                        fn: function (data) {
                            var result = FilterThis.get('value.val').filter(function (filterExtra) {
                                return data[filterExtra] != undefined
                            })

                            console.log(Object.keys(data).length , result.length);
                            return (Object.keys(data).length == result.length)
                        }
                    }
                },
                components: {

                },
                init: function (options) {
                    this._super(options);
                    var that = this;
                    FilterThis = this;

                    this.on({
                        change: function (data) {

                        },
                        onChecked: function (data) {
                            if (data && data.context) {
                                if (data.context.isChecked) {
                                    this.push('value.val', data.context.value)
                                } else if (!data.context.isChecked) {
                                    this.splice('value.val', this.get('value.val').indexOf(data.context.value), 1);
                                }
                            }
                            //console.log('onChecked', this.get('value'));
                        },
                        teardown: function (evt) {
                            FilterThis = null;
                        }
                    })
                },


                parse: function (end) {

                },


                beforeInit: function (data) {
                    //console.log('beforeInit');
                },

                complete: function (data) {
                    //console.log('complete');
                }
            });

            return FilterExtra;
        }]);


