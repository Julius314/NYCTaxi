import Processors from 'kepler.gl/processors';
import cabsource_all from './taxi_label_all'
import poisource_all from './poi_label_all'
import cabsource_day from './taxi_label_day'
import poisource_day from './poi_label_day'
import cabsource_end from './taxi_label_end'
import poisource_end from './poi_label_end'

const cabinfo = { 
    id: 'trip_data',
    label: 'NYC Cab Rides' 
};

const poiinfo = { 
    id: 'poi_data',
    label: 'Point of Interests NYC' 
};

const cabdata_all = Processors.processCsvData(cabsource_all);
const poidata_all = Processors.processCsvData(poisource_all);
const cabdata_day = Processors.processCsvData(cabsource_day);
const poidata_day = Processors.processCsvData(poisource_day);
const cabdata_end = Processors.processCsvData(cabsource_end);
const poidata_end = Processors.processCsvData(poisource_end);

export const cabdataset_all = {info:cabinfo,data:cabdata_all};
export const poidataset_all = {info:poiinfo,data:poidata_all};
export const cabdataset_day = {info:cabinfo,data:cabdata_day};
export const poidataset_day = {info:poiinfo,data:poidata_day};
export const cabdataset_end = {info:cabinfo,data:cabdata_end};
export const poidataset_end = {info:poiinfo,data:poidata_end};
