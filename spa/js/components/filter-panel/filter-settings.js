angular.module('innaApp.services')
    .service('FilterSettings', [
        function () {
            /**
             * Модель панели фильтрации
             * Наследуется от Ractive
             * Можно сделать set данных и получить их get
             *
             * Можно слушать событие change изменение модели
             * FilterSettings.on('change', function(){})
             */
            var isFullWL = window.partners ? window.partners.isFullWLOrB2bWl() : false;

            var Model = Ractive.extend({
                data: {
                    settings: {
                        HotelName: {
                            value: ''
                        },
                        AirTime: [
                            {
                                direction: 'to',
                                title: 'Перелет туда',
                                state: [
                                    {
                                        isActive: true,
                                        title: 'Вылет',
                                        value: 'DepartureDate'
                                    },
                                    {
                                        title: 'Прилет',
                                        value: 'ArrivalDate'
                                    }
                                ],
                                dayState: [
                                    {
                                        state: 'Morning',
                                        name: 'Утро'
                                    },
                                    {
                                        state: 'Afternoon',
                                        name: 'День'
                                    },
                                    {
                                        state: 'Evening',
                                        name: 'Вечер'
                                    },
                                    {
                                        state: 'Night',
                                        name: 'Ночь'
                                    }
                                ]
                            },
                            {
                                direction: 'back',
                                title: 'Перелет обратно',
                                state: [
                                    {
                                        isActive: true,
                                        title: 'Вылет',
                                        value: 'BackDepartureDate'
                                    },
                                    {
                                        title: 'Прилет',
                                        value: 'BackArrivalDate'
                                    }
                                ],
                                dayState: [
                                    {
                                        state: 'Morning',
                                        name: 'Утро'
                                    },
                                    {
                                        state: 'Afternoon',
                                        name: 'День'
                                    },
                                    {
                                        state: 'Evening',
                                        name: 'Вечер'
                                    },
                                    {
                                        state: 'Night',
                                        name: 'Ночь'
                                    }
                                ]
                            }
                        ],
                        Hotels: {

                        },
                        Tickets: {

                        },

                        sort: {
                            hotels: [
                                {
                                    name: 'Цена',
                                    value: 'byPackagePrice',
                                    isChecked: true
                                },
                                {
                                    name: 'Скидка',
                                    value: 'byProfit',
                                },
                                {
                                    name: 'Лучшие',
                                    value: 'byTaFactor'
                                },

                                // {
                                //     name: isFullWL ? 'По рейтингу' : 'По рейтингу Инна Тур',
                                //     value: 'byRecommendedFactor'
                                // },
                                // {
                                //     name: 'По названию',
                                //     value: 'byName'
                                // },

                            ],
                            avia: [
                                {
                                    name: 'Цена',
                                    value: 'byPackagePrice',
                                    isChecked: true
                                },
                                {
                                    name: 'Лучшие',
                                    value: 'byRecommend'
                                },
                                {
                                    name: 'Время в  пути',
                                    value: 'byTripTime'
                                },
                                // {
                                //     name: 'По времени отправления ТУДА',
                                //     value: 'byDepartureDate'
                                // },
                                // {
                                //     name: 'По времени отправления ОБРАТНО',
                                //     value: 'byBackDepartureDate'
                                // },
                                // {
                                //     name: 'По времени прибытия ТУДА',
                                //     value: 'byArrivalDate'
                                // },
                                // {
                                //     name: 'По времени прибытия ОБРАТНО',
                                //     value: 'byBackArrivalDate'
                                // }
                            ]
                        }
                    },
                    model : null
                },

                onrender: function () {


                }
            });

            var newModel = new Model();

            newModel.on({
                change: function (value) {

                }
            });

            return newModel;
        }
    ]);
