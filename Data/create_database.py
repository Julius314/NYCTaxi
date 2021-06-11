import pandas as pd
import matplotlib.pyplot as plt

## Preprocessing of Data


# Load Taxi Data
# First 4693983 rows from April
read_taxi = pd.read_csv("../../2016_Yellow_Taxi_Trip_Data.csv",
                        usecols=["tpep_pickup_datetime",
                                 "tpep_dropoff_datetime", "passenger_count", "trip_distance", "pickup_longitude",
                                 "pickup_latitude", "dropoff_longitude", "dropoff_latitude",
                                 "fare_amount", "total_amount"],
                        #skiprows=range(1, 65582521),
                        nrows=4693983)
                        #nrows=1000)


# Filter: only April
read_taxi = read_taxi[read_taxi['tpep_pickup_datetime'].str.startswith('04/')]


# Filter: Bounding Box for NYC
read_taxi = read_taxi[(read_taxi['dropoff_latitude'] >= 40.495992) & (read_taxi['dropoff_latitude'] <= 40.915568) &
                      (read_taxi['dropoff_longitude'] >= -74.257159) & (read_taxi['dropoff_longitude'] <= -73.699215) &
                      (read_taxi['pickup_latitude'] >= 40.495992) & (read_taxi['pickup_latitude'] <= 40.915568) &
                      (read_taxi['pickup_longitude'] >= -74.257159) & (read_taxi['pickup_longitude'] <= -73.699215)]

# Filter: trip_distance < 500
#read_taxi.hist(column='trip_distance', bins=1500)
#plt.show()
#high_dist = read_taxi[read_taxi['trip_distance'] > 500]
#high_dist.hist(column='trip_distance', bins=500)
#plt.show()
#read_taxi = read_taxi[read_taxi['trip_distance'] < 500]
#read_taxi.hist(column='trip_distance', bins=500)
#plt.show()


# Random sample to get less data
read_taxi = read_taxi.sample(n=101500, random_state=1)


# Convert date and time
read_taxi['tpep_pickup_datetime'] = pd.to_datetime(read_taxi['tpep_pickup_datetime'])
read_taxi['tpep_dropoff_datetime'] = pd.to_datetime(read_taxi['tpep_dropoff_datetime'])
# Filter: pickup before dropoff
read_taxi = read_taxi[read_taxi['tpep_pickup_datetime'] <= read_taxi['tpep_dropoff_datetime']]


# Calculate trip duration
read_taxi['trip_duration'] = read_taxi['tpep_dropoff_datetime'] - read_taxi['tpep_pickup_datetime']
read_taxi['trip_duration'] = read_taxi['trip_duration'].dt.total_seconds() / 60
#read_taxi.hist(column='trip_duration', bins=500)
#plt.show()
# Outliers: trip_duration > 200
#read_taxi_out = read_taxi[read_taxi['trip_duration'] >= 200]
#read_taxi_out.hist(column='trip_duration', bins=150)
#plt.show()

# Filter: trip_duration < 600
read_taxi = read_taxi[read_taxi['trip_duration'] < 600]
#read_taxi.hist(column='trip_duration', bins=150)
#plt.show()



# Separate date and time for pickup and dropoff
read_taxi["pickup_date"] = read_taxi['tpep_pickup_datetime'].dt.date
read_taxi["pickup_time"] = read_taxi['tpep_pickup_datetime'].dt.time
read_taxi["dropoff_date"] = read_taxi['tpep_dropoff_datetime'].dt.date
read_taxi["dropoff_time"] = read_taxi['tpep_dropoff_datetime'].dt.time
read_taxi.drop(columns=["tpep_pickup_datetime","tpep_dropoff_datetime"], inplace=True)
# read_taxi["pickup_date"] = pd.to_datetime(read_taxi['pickup_date'], format='%m/%d/%Y').dt.date
# read_taxi["pickup_time"] = pd.to_datetime(read_taxi['pickup_time']).dt.strftime("%H:%M:%S")
# read_taxi["dropoff_date"] = pd.to_datetime(read_taxi['dropoff_date'], format='%m/%d/%Y').dt.date
# read_taxi["dropoff_time"] = pd.to_datetime(read_taxi['dropoff_time']).dt.strftime("%H:%M:%S")

# Get weekday
read_taxi['weekday'] = pd.to_datetime(read_taxi['pickup_date']).dt.dayofweek

# Ratio of trip duration and trip distance
read_taxi['min/m'] = read_taxi['trip_duration'] / read_taxi['trip_distance']
read_taxi.loc[read_taxi['trip_distance'] == 0, 'min/m'] = read_taxi['trip_duration']
read_taxi.hist(column='min/m', bins=500)
plt.show()
# Outliers: > 75
read_taxi_out = read_taxi[read_taxi['min/m'] >= 75]
read_taxi_out.hist(column='min/m', bins=200)
plt.show()
# Filter: < 100 minutes / mile
read_taxi = read_taxi[read_taxi['min/m'] < 100]
read_taxi.hist(column='min/m', bins=200)
plt.show()
# Binning for values <= 20
lowmin = read_taxi[read_taxi['min/m'] <= 20]
low_bins = pd.cut(lowmin['min/m'], 9, labels=False)
read_taxi.loc[read_taxi['min/m'] <= 20, 'min_bins'] = low_bins
read_taxi.loc[read_taxi['min/m'] > 20, 'min_bins'] = 9
read_taxi['min_bins'] = read_taxi['min_bins'].astype(int)
read_taxi.drop(columns=["min/m"], inplace=True)


# Ratio of trip distance and fare amount (subtract 2.5 initial charge)
read_taxi.loc[read_taxi['fare_amount'] > 0, 'dollar/m'] = (read_taxi['fare_amount'] - 2.5) / \
                                                                      read_taxi['trip_distance']
read_taxi.loc[read_taxi['trip_distance'] <= 0, 'dollar/m'] = (read_taxi['fare_amount'] - 2.5)
# Clip between 0 and 40 to maintain reasonable range
read_taxi.loc[read_taxi['dollar/m'] < 0, 'dollar/m'] = 0
read_taxi.loc[read_taxi['dollar/m'] > 40, 'dollar/m'] = 40

read_taxi.hist(column='dollar/m', bins=200)
plt.show()


# Save dataframe as csv
read_taxi.to_csv('new_taxidata.csv', index=False)











### Old: create databases


# # Load Weather Data
# read_weather = pd.read_csv("weatherdata_ny2018.csv",
#                            usecols=["STATION", "DATE", "REPORT_TYPE", "SOURCE",
#                                     "DailyAverageDewPointTemperature", "DailyAverageDryBulbTemperature",
#                                     "DailyAverageRelativeHumidity",
#                                     "DailyAverageWetBulbTemperature", "DailyAverageWindSpeed", "DailyCoolingDegreeDays",
#                                     "DailyDepartureFromNormalAverageTemperature", "DailyHeatingDegreeDays",
#                                     "DailyMaximumDryBulbTemperature", "DailyMinimumDryBulbTemperature",
#                                     "DailyPrecipitation", "DailySnowDepth",
#                                     "DailySnowfall"],
#                            dtype={'STATION': int, 'DATE': str, 'REPORT_TYPE': str, 'SOURCE': int,
#                                   "DailyAverageDewPointTemperature": float, "DailyAverageDryBulbTemperature": float,
#                                   "DailyAverageRelativeHumidity": float,
#                                   "DailyAverageWetBulbTemperature": float, "DailyAverageWindSpeed": float,
#                                   "DailyCoolingDegreeDays": float,
#                                   "DailyDepartureFromNormalAverageTemperature": float, "DailyHeatingDegreeDays": float,
#                                   "DailyMaximumDryBulbTemperature": float, "DailyMinimumDryBulbTemperature": float,
#                                   "DailyPrecipitation": str,
#                                   "DailySnowDepth": str, "DailySnowfall": str})
#
# # Filter weather for report SOD to only get summarized values for each day
# read_weather = read_weather[read_weather.REPORT_TYPE.str.contains("SOD")]
#
# # Only save data, without time
# read_weather["DATE"] = pd.to_datetime(read_weather['DATE'], format='%Y-%m-%d').dt.date


# # Create Database
# conn = sqlite3.connect('database.db')
# c = conn.cursor()
#
# # Create empty tables
# c.execute('''CREATE TABLE IF NOT EXISTS TAXI_TRIPS
#              ([generated_id] INTEGER PRIMARY KEY, VendorID,
#                passenger_count, trip_distance, pickup_longitude,
#                pickup_latitude, dropoff_longitude, dropoff_latitude,
#                fare_amount, total_amount, pickup_date, pickup_time,
#                dropoff_date, dropoff_time)''')
#
# c.execute('''CREATE TABLE IF NOT EXISTS WEATHER
#             ([generated_id] INTEGER PRIMARY KEY, STATION, DATE, REPORT_TYPE, SOURCE,
#               DailyAverageDewPointTemperature, DailyAverageDryBulbTemperature, DailyAverageRelativeHumidity,
#               DailyAverageWetBulbTemperature, DailyAverageWindSpeed, DailyCoolingDegreeDays,
#               DailyDepartureFromNormalAverageTemperature, DailyHeatingDegreeDays,
#               DailyMaximumDryBulbTemperature, DailyMinimumDryBulbTemperature, DailyPrecipitation, DailySnowDepth,
#               DailySnowfall)''')
#
#
# # Insert the values from the csv files into tables
# read_taxi.to_sql('TAXI_TRIPS', conn, if_exists='append', index=False)
# print("Taxi data done.")
# read_weather.to_sql('WEATHER', conn, if_exists='append', index=False)
# print("Weather data done.")
#
