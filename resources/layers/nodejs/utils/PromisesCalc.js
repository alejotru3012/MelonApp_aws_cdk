const moment = require('moment-timezone');

module.exports = class PromisesCalculator {

    constructor(order, sh_details, offDays , nowDate) {
        this.order = order
        this.sh_details = sh_details;
        this.offDays = offDays;
        this.date = nowDate;
        this.promises = {
            pack_promise_min: null,
            pack_promise_max: null,
            ship_promise_min: null,
            ship_promise_max: null,
            delivery_promise_min: null,
            delivery_promise_max: null,
            ready_pickup_promise_min: null,
            ready_pickup_promise_max: null
        }
    }

    nextBusinessDays() {
        let nbd = [];
        let day = moment(this.date).format('YYYY-MM-DD');

        while (nbd.length < 10) {
            day = moment(day).add(1, 'days').format('YYYY-MM-DD');
            if (!this.offDays.includes(day)){
                nbd.push(day);
            }
            // console.log(day);
        }
        return nbd;
    }

    validateWeight() {
        const items = this.order.items;
        let orderWeight = 0;
        items.forEach(item => orderWeight += item.product_weight);
        const minWeight = this.sh_details.rules.availability.byWeight.min;
        const maxWeight = this.sh_details.rules.availability.byWeight.max;
        if (orderWeight >= minWeight && orderWeight <= maxWeight)
            return true;
        else
            return false;
    }

    validateTimeAvailability() {
        const dayType = this.sh_details.rules.availability.byRequestTime.dayType;
        const fromTimeOfDay = this.sh_details.rules.availability.byRequestTime.fromTimeOfDay;
        const toTimeOfDay = this.sh_details.rules.availability.byRequestTime.toTimeOfDay;
        const day = moment(this.date).format('YYYY-MM-DD');
        if (dayType == 'BUSINESS') {
            if (this.offDays.includes(day)) return false;
        }
        const hour = parseInt(moment(this.date).hour())
        if (hour >= fromTimeOfDay && hour <= toTimeOfDay)
            return true
        else
            return false;
    }

    determineCase() {
        const cases = this.sh_details.rules.promisesParameters.cases;
        let priority = 1;
        const cs = cases.filter(c => c.priority == priority)[0]
        while (cs != undefined) {
            const dayType = cs.condition.byRequestTime.dayType;
            const fromTimeOfDay = cs.condition.byRequestTime.fromTimeOfDay;
            const toTimeOfDay = cs.condition.byRequestTime.toTimeOfDay;
            const day = moment(this.date).format('YYYY-MM-DD');
            if (dayType == 'BUSINESS' && this.offDays.includes(day)) {
                priority++;
            } else {
                const hour = parseInt(moment(this.date).hour())
                if (hour >= fromTimeOfDay && hour <= toTimeOfDay)
                    return cs
                else
                    priority++;
            }
            cs = cases.filter(c => c.priority == priority)[0]
        }
        return false;
    }

    calculatePromises(promiseName, promiseParams, nbd) {
        //calculate min
        const minType = promiseParams.min.type;
        let day =  moment.tz(this.date, 'America/Bogota');
        switch (minType) {
            case 'NULL':
                this.promises[`${promiseName}_min`] = null;
                break;
            case 'DELTA-HOURS':
                const minDeltaHours = promiseParams.min.deltaHours;
                day = day.add(minDeltaHours, 'h');
                // const minPromise =`${day.tz('Etc/GMT-0').format('MMM D')} at ${day.tz('Etc/GMT-0').format('ha')}`;
                const monthDay = day.tz('Etc/GMT-0').format('MMM D');
                let time = day.tz('Etc/GMT-0').format('ha');
                console.log(`${monthDay} at ${time}`);
                let aux = `${monthDay} at ${time}`;
                this.promises[`${promiseName}_min`] = aux.toString();
            case 'DELTA-BUSINESSDAYS':
                const minDeltaBusinessDays = promiseParams.min.deltaBusinessDays;
                day = nbd[minDeltaBusinessDays -1];
                time = promiseParams.min.timeOfDay;
                const date = moment.tz(`${day} ${time}`, 'America/Bogota');
                this.promises[`${promiseName}_min`] = `${date.tz('Etc/GMT-0').format('MMM D')} at ${date.tz('Etc/GMT-0').format('ha')}`;
            default:
                break;
        }
        //calculate max
        const maxType = promiseParams.max.type;
        day =  moment.tz(this.date, 'America/Bogota');
        switch (maxType) {
            case 'NULL':
                this.promises[`${promiseName}_max`] = null;
                break;
            case 'DELTA-HOURS':
                const maxDeltaHours = promiseParams.max.deltaHours;
                day = day.add(maxDeltaHours, 'h');
                this.promises[`${promiseName}_max`] = `${day.tz('Etc/GMT-0').format('MMM D')} at ${day.tz('Etc/GMT-0').format('ha')}`;
            case 'DELTA-BUSINESSDAYS':
                const maxDeltaBusinessDays = promiseParams.max.deltaBusinessDays;
                day = nbd[maxDeltaBusinessDays -1];
                const time = promiseParams.max.timeOfDay;
                const date = moment.tz(`${day} ${time}`, 'America/Bogota');
                this.promises[`${promiseName}_max`] = `${date.tz('Etc/GMT-0').format('MMM D')} at ${date.tz('Etc/GMT-0').format('ha')}`;
            default:
                break;
        }

    }

    calculate() {
        const nbd = this.nextBusinessDays();
        // console.log(nbd);
        if (!this.validateWeight()) return this.promises;
        if (!this.validateTimeAvailability()) return this.promises;
        const cs = this.determineCase();
        if (cs == false) return this.promises;

        // Pack promise
        this.calculatePromises('pack_promise', cs.packPromise, nbd);
        this.calculatePromises('ship_promise', cs.shipPromise, nbd);
        this.calculatePromises('delivery_promise', cs.deliveryPromise, nbd);
        this.calculatePromises('pack_pready_pickup_promiseromise', cs.readyPickUpPromise, nbd);
        console.log(this.promises);
        return this.promises;
    }




}
