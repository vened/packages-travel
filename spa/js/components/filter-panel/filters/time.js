angular.module('innaApp.components').
    factory('FilterTime', [
        'EventManager',
        '$filter',
        '$templateCache',
        '$routeParams',
        'innaApp.API.events',

        'ClassFilter',
        function (EventManager, $filter, $templateCache, $routeParams, Events, ClassFilter) {

            /**
             * Главный компонент FilterTime имеет набор данных airTime
             * Дочерние компоненты соответственно имеют тот же самый набор
             * Тем самым изменяя данные дочерними компонентами,
             * parent может отслеживать изменения в общем наборе данных
             *
             *
             * getDesignationDayTime
             *  'Утро', 6, 12,
             *  'День', 12, 18,
             *  'Вечер', 18, 24
             *  'Ночь', 0, 6
             *
             * @type {null}
             */
            var FilterTime = ClassFilter.extend({
                template: $templateCache.get('components/filter-panel/templ-filters/time.hbs.html'),
                data: {
                    value: {
                        name: 'DepartureDate',
                        val: [],

                        // todo: получает на вход сам item билета
                        // немного сложная фильтрация
                        fn: function (data_item, component_val) {
                            var data = angular.copy(data_item);
                            data_item = null;
                            var partDaysConf = [
                                {
                                    value: 'Morning',
                                    start: '6',
                                    end: '12'
                                },
                                {
                                    value: 'Afternoon',
                                    start: '12',
                                    end: '18'
                                },
                                {
                                    value: 'Evening',
                                    start: '18',
                                    end: '24'
                                },
                                {
                                    value: 'Night',
                                    start: '0',
                                    end: '6'
                                }
                            ];

                            if (!data.DepartureDate) throw new Error('error');


                            // проходим по собранным значениям
                            var resultFilterTimeDate = component_val.val.filter(function (item) {

                                // берем дату - значения направления
                                // предполагаем что дата валидна
                                var stateResult = item.state.filter(function (st) {
                                    return st.isActive;
                                });


                                var timeTicket = moment(data[stateResult[0].value]);
                                var hours = timeTicket.hours();
                                var minute = timeTicket.minute();

                                /** если есть минуты, то к часу прибавляем еще один час */
                                //if (minute) hours + 1


                                /** выбранные части дня */

                                var resultPartDay = item.dayState.filter(function (dayItem) {

                                    if (!dayItem.isChecked) return false;


                                    // получаем выбранную часть дня
                                    var partDay = (function (part) {
                                        var result = partDaysConf.filter(function (dayTime) {
                                            return dayTime.value == part;
                                        });
                                        return result[0];
                                    }(dayItem.state))


                                    /**
                                     * сравниваем часть дня и время вылета - прилета
                                     * если время входит в диапазон части дня, то возвращаем true
                                     */
                                    //console.log(hours, partDay.start, partDay.end);

                                    if ((hours >= partDay.start) && (hours <= partDay.end)) {
                                        return true;
                                    }
                                });


                                /** Если хоть одна часть дня есть во времени билета */
                                if (resultPartDay.length) return true;
                            });

                            // если хоть какой то вернулься результат фильтрации
                            if (resultFilterTimeDate.length) {
                                // условие AND
                                if (component_val.val.length == resultFilterTimeDate.length) {
                                    return true;
                                }
                            }


                        }
                    }
                },

                init: function (options) {
                    this._super(options);
                    var that = this;

                    this.on({
                        change: function (data) {
                        },

                        filterChange: function (data) {
                            this.set('value.val', this.filter());
                            this._parent.fire('changeChildFilter', this.get('value.val'));
                            this.hasSelected();
                        },

                        changeState: function () {
                            this.set('value.val', this.filter());
                        },

                        resetFilter: function (data) {
                            var that = this;

                            if (data && data.context) {
                                this.get('airTime').forEach(function (item, i) {
                                    if (item.direction == data.context.direction) {
                                        that.set('airTime.' + i + '.state.0.isActive', true);
                                        that.set('airTime.' + i + '.state.1.isActive', false);
                                        that.set('airTime.' + i + '.dayState.*.isChecked', false);
                                    }
                                });
                            } else {
                                that.set('airTime.*.state.0.isActive', true);
                                that.set('airTime.*.state.1.isActive', false);
                                that.set('airTime.*.dayState.*.isChecked', false);
                            }

                            this.set('value.val', this.filter());
                            this.hasSelected();
                        },

                        teardown: function (evt) {

                        }
                    });
                },

                /**
                 * Сбор данных, проходим по airTime и
                 * собираем только те данные которые isActive или isChecked
                 * @returns {Array}
                 */
                filter: function () {
                    var result = this.get('airTime').filter(function (item) {
                        var dayStateResult = item.dayState.filter(function (st) {
                            return st.isChecked ? true : false;
                        });
                        if (dayStateResult.length) return true;
                    });

                    return result;
                },


                /**
                 * Копипаста метода filter
                 *
                 * @param data
                 * @override
                 */
                IndicatorFiltersItemRemove: function (data) {
                    this._super(data);
                    var that = this;

                    this.get('airTime').forEach(function (item, i) {
                        item.dayState.forEach(function (st, j) {
                            if ((item.direction == data.direction) && (st.state == data.state)) {
                                that.set('airTime.' + i + '.dayState.' + j + '.isChecked', false);
                                st.isChecked = false;
                            }
                        });
                    });

                    this.fire('filterChange');
                    this._parent.fire('changeChildFilter', this.get('value.val'));
                    this.hasSelected();
                }
            });

            return FilterTime;
        }]);

