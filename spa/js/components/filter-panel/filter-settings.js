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
            var isUsingPartners = window.partners ? window.partners.isUsingPartners() : false;

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
                                    name: 'По цене пакета',
                                    value: 'byPackagePrice',
                                    isChecked: true
                                },
                                {
                                    name: isUsingPartners ? 'По рейтингу' : 'По рейтингу Инна Тур',
                                    value: 'byRecommendedFactor'
                                },
                                {
                                    name: 'По рейтингу Trip Advisor',
                                    value: 'byTaFactor'
                                },
                                {
                                    name: 'По названию',
                                    value: 'byName'
                                },
                                {
                                    name: 'По размеру скидки в руб',
                                    value: 'byProfit'
                                }
                            ],
                            avia: [
                                {
                                    name: 'По цене пакета',
                                    value: 'byPackagePrice',
                                    isChecked: true
                                },
                                {
                                    name: 'По рейтингу',
                                    value: 'byRecommend'
                                },
                                {
                                    name: 'По времени в пути',
                                    value: 'byTripTime'
                                },
                                {
                                    name: 'По времени отправления ТУДА',
                                    value: 'byDepartureDate'
                                },
                                {
                                    name: 'По времени отправления ОБРАТНО',
                                    value: 'byBackDepartureDate'
                                },
                                {
                                    name: 'По времени прибытия ТУДА',
                                    value: 'byArrivalDate'
                                },
                                {
                                    name: 'По времени прибытия ОБРАТНО',
                                    value: 'byBackArrivalDate'
                                }
                            ]
                        }
                    },
                    model : null
                },

                init: function () {


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
