angular.module('innaApp.conponents').
    factory('TicketItem', [
        'EventManager',
        'innaApp.API.events',
        '$filter',
        '$routeParams',
        'aviaHelper',
        '$templateCache',
        'DynamicBlock',
        function (EventManager, Events, $filter, $routeParams, aviaHelper, $templateCache, DynamicBlock) {

            /**
             * Компонент TicketItem
             * @constructor
             * @inherits DynamicBlock
             */
            var TicketItem = DynamicBlock.extend({
                template: $templateCache.get('components/dynamic-block/templ/base.hbs.html'),
                append: true,
                data: {
                    settings: {
                        height: 200,
                        countColumn: 2,
                        classBlock: 'b-result_col_two_short b-result_flight-info'
                    },
                    showWarning : function(){
                        return this.showWarning;
                    },
                    airLogo : aviaHelper.setEtapsTransporterCodeUrl
                },
                partials: {
                    collOneContent: $templateCache.get('components/dynamic-block/templ/avia-dp.hbs.html'),
                    collTwoContent: $templateCache.get('components/dynamic-block/templ/combination-price.hbs.html')
                },


                init: function () {
                    var that = this;

                    var modelTicket = new inna.Models.Avia.Ticket();
                    modelTicket.setData(this.get('ticket'));
                    var virtualBundle = new inna.Models.Dynamic.Combination();
                    virtualBundle.ticket = modelTicket;
                    virtualBundle.hotel = this.get('combinationModel').hotel;

                    console.log(modelTicket.collectAirlines().etap);

                    this.set({
                        virtualBundle: virtualBundle,
                        modelTicket: modelTicket
                    });



                    //console.log(this.get('ticket'));

                    this.on({
                        setCurrent: this.setCurrent,
                        getTicketDetails: this.getHotelDetails,
                        change: function (data) {

                        },
                        teardown: function (evt) {
                            //console.log('teardown ticket item');
                        }
                    });
                },

                getTicketDetails: function () {
                    EventManager.fire(Events.DYNAMIC_SERP_TICKET_DETAILED_REQUESTED, this.get('modelTicket'));
                },

                setCurrent: function () {
                    EventManager.fire(Events.DYNAMIC_SERP_CHOOSE_TICKET, this.get('modelTicket'));
                },

                showWarning: function () {
                    console.log('showWarning showWarning showWarning');
                    var n = parseInt(this.get('NumSeats'));
                    var routParam = angular.copy($routeParams);
                    var passengerCount = parseInt(routParam.Adult) + (routParam.ChildrenAges ? routParam.ChildrenAges.length : 0);

                    if(!n) return false;

                    switch (passengerCount) {
                        case 1:
                            return (n < 4);
                        case 2:
                            return (n < 7);
                        default:
                            return (n < 10);
                    }

                    return false;
                },

                parse: function (data) {


                    return data;
                }

            });

            return TicketItem;
        }]);

