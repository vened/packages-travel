inna.Models.WlNewSearch = function (data) {
    var self = this;

    self.btnClick = function () {
        location.href = 'http://biletix.ru/packages/';
    }

    self.from = '';
    self.to = '';
    self.start = '';
    self.end = '';
    self.passengerCount = '';
    self.ticketClass = '';

    self.dateFilter = null;
    self.timeFormat = 'd MMMM';

    if (data != null) {
        if (data.dateFilter != null) {
            self.dateFilter = data.dateFilter;
        }
        if (data.from != null) {
            self.from = data.from;
        }
        if (data.to != null) {
            self.to = data.to;
        }
        if (data.start != null) {
            if (self.dateFilter){
                self.start = self.dateFilter(data.start, self.timeFormat);
            }
            else{
                self.start = data.start;
            }
        }
        if (data.end != null) {
            if (self.dateFilter) {
                self.end = self.dateFilter(data.end, self.timeFormat);
            }
            else {
                self.end = data.end;
            }
        }
        if (data.passengerCount != null) {
            self.passengerCount = data.passengerCount;
        }
        if (data.ticketClass != null) {
            try {
                data.ticketClass = parseInt(data.ticketClass);
            }
            catch (e) { };
            switch (data.ticketClass) {
                case 0: self.ticketClass = 'эконом'; break;
                case 1: self.ticketClass = 'бизнес'; break;
            }
        }
    }
}