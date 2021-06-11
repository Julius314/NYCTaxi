import json
import pandas as pd
import requests
import time

#gets pois for weekdays, weekends, and all data
centerstr = ['day','end','all']

for end in centerstr:
    print(end)
    #get clustercenters
    with open('../src/data/clustercenter_' + str(end) + '.js', 'r') as ori: centers = ori.read()

    pois = pd.DataFrame(columns = ['name', 'latitude', 'longitude', 'type' , 'nRatings', 'cluster'])

    URL="https://maps.googleapis.com/maps/api/place/nearbysearch/json?"
    akey='AIzaSyDgvfXagUbRavpAIE4WAeZ_WOno0P5UlKs'
    akey2='AIzaSyBcXG4izeij1zQFK8X1l4VrYR4k8jQ1k7w'

    #remove js pre string (export default)
    centers = json.loads(centers[15:])
    #omit clustercenters for unclustered data
    centers = centers[2:]

    for center in centers:

        print(center)
        att = 0

        PARAMS = {'location': f"{center['location']['latitude']},{center['location']['longitude']}",'radius':300,'key':akey2}
        
        try:
            r = requests.get(url = URL, params = PARAMS)
        except:
            print("no proper response request")
            continue

        #if request failed
        while r.json().get('status',"no") != 'OK':
            #switch keys
            if PARAMS.get('key',"") == akey:
                PARAMS['key'] = akey2
            else:
                PARAMS['key'] = akey

            #retry            
            r = requests.get(url = URL, params = PARAMS)

            print('ERROR in response!, try again in 30s')
            print(r.json()['status'])

            att = att + 1
            if att > 5:
                att = 0
                break
            
            if r.json().get('status',"no") != 'OK':
                time.sleep(30)
            
            
        #request was successful
        if r.json().get('status',"no") == 'OK':
            print("request successful")
            unsorted = r.json().get('results',[])
            
            #add user_rating_column if not exists
            for r in unsorted:
                if 'user_ratings_total' not in r:
                    r['user_ratings_total'] = 0

            #sort by number of user ratings
            sort = sorted(unsorted, key = lambda i: i['user_ratings_total'],reverse=True) 
            n = 0
            for entry in sort:
                #exclude New York locality, which is included in every response
                if entry['name'] != 'New York':
                    pois = pois.append({
                        'name': entry['name'],
                        'latitude': entry['geometry']['location']['lat'],
                        'longitude': entry['geometry']['location']['lng'],
                        'type': entry['types'][0],
                        'nRatings':entry['user_ratings_total'],
                        'cluster': center['value'],
                        'icon': 'pin'
                    },ignore_index=True)
                #max 10 entries
                if n >= 10:
                    break
                n = n+1

    #write to file
    filename = "../src/data/poi_label_" + str(end) + ".js"
    pois.to_csv(filename)
    with open(filename, 'r') as rl: da = rl.read()
    with open(filename, 'w') as md: md.write("export default `id" + da + "`")

