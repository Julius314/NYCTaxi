from sklearn.cluster import DBSCAN
import sklearn.utils
#from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np
import json
import requests
import matplotlib.pyplot as plt

# Load Taxi Data
read_taxi = pd.read_csv("./new_taxidata.csv",
                        usecols=["passenger_count", "trip_distance", "pickup_longitude",
                                 "pickup_latitude", "dropoff_longitude", "dropoff_latitude",
                                 "fare_amount", "total_amount", "trip_duration",
                                 "pickup_date","pickup_time","dropoff_date","dropoff_time",
                                 "weekday", "min_bins", "dollar/m"])


#split between weekday (Mo-Th) & weekend (Fr-Su)
taxi = [
    {'name': 'all', 'df': read_taxi},
    {'name': 'day', 'df': read_taxi.loc[read_taxi['weekday'] < 4]},
    {'name': 'end', 'df': read_taxi.loc[read_taxi['weekday'] >= 4]}]


for entry in taxi:

    print(f"Week{entry['name']} samples: {len(entry['df'])}")
    print(entry.get("df").columns.tolist())


    #select pickups & dropoffs together for clustering
    double = pd.concat([entry.get("df")[['dropoff_latitude', 'dropoff_longitude']].rename(columns={'dropoff_latitude':'latitude',
                                                                                        'dropoff_longitude':'longitude'}),
                    entry.get("df")[['pickup_latitude', 'pickup_longitude']].rename(columns={'pickup_latitude': 'latitude',
                                                                                        'pickup_longitude': 'longitude'})])

    #run dbscan
    db = DBSCAN(eps=0.001, min_samples=(0.003*len(double))).fit(double)

    #number of cluster
    nCluster = len(set(db.labels_))
    print(f'{nCluster} clusters')


    #add cluster to dataframe
    entry.get("df")["cluster_dropoff"] = db.labels_[:len((db.labels_))//2]
    entry.get("df")["cluster_pickup"] = db.labels_[len((db.labels_))//2:]

    #increment by 1 to get rid of zero cluster
    #read_taxi.loc[read_taxi['cluster'] != -1, 'cluster'] += 1
    entry.get("df").loc[entry.get("df")['cluster_dropoff'] != -1, 'cluster_dropoff'] += 1
    entry.get("df").loc[entry.get("df")['cluster_pickup'] != -1, 'cluster_pickup'] += 1

    # create icons to encode more information:
    entry.get("df").loc[entry.get("df")['cluster_dropoff'] != -1, 'icon_drop'] = 'circle'
    entry.get("df").loc[entry.get("df")['cluster_pickup'] != -1, 'icon_pick'] = 'play'

    #create radius (unclustered datapoints will be smaller)
    entry.get("df").loc[entry.get("df")['cluster_dropoff'] == -1, 'radius_drop'] = 1
    entry.get("df").loc[entry.get("df")['cluster_dropoff'] != -1, 'radius_drop'] = 2
    entry.get("df").loc[entry.get("df")['cluster_pickup'] == -1, 'radius_pick'] = 1
    entry.get("df").loc[entry.get("df")['cluster_pickup'] != -1, 'radius_pick'] = 2


    #get center of each cluster
    maxDrop = entry.get("df")['cluster_dropoff'].max()
    entry['centers'] = []

    #center for unclustered datapoints
    entry['centers'].append({'value': None, 'label': 'all', 'location': {'zoom': 11.1, 'latitude': 40.7632, 'longitude': -73.9312}})
    entry['centers'].append({'value': -1, 'label': -1, 'location': {'zoom': 11.1, 'latitude': 40.7632, 'longitude': -73.9312}})

    for idx in range(1,maxDrop+1):
        cluster = entry.get("df").loc[entry.get("df")['cluster_dropoff'] == idx]

        location = {'zoom': 16, 'latitude': cluster['dropoff_latitude'].sum()/cluster.shape[0], 'longitude': cluster['dropoff_longitude'].sum()/cluster.shape[0]}
        entry['centers'].append({'value': idx, 'label': idx, 'location': location})

    #write cluster centers to file
    filename = '../src/data/clustercenter_' + str(entry.get('name')) + '.js'
    with open(filename, 'w') as outfile: json.dump(entry.get('centers'), outfile)
    with open(filename, 'r') as ori: cntr = ori.read()
    with open(filename, 'w') as mod: mod.write("export default " + cntr)

    # Write to csv
    filename = f'../src/data/taxi_label_{entry.get("name")}.js'
    entry.get('df').to_csv(filename)
    #prepend js (export default)
    with open(filename, 'r') as original: data = original.read()
    with open(filename, 'w') as modified: modified.write("export default `id" + data + "`")

