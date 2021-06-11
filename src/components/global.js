global.position = {
    latitude: 40.7632,
    longitude:  -73.9312,
    zoom: 11.1
}

global.linesActive = false;
global.activeCluster = null;

global.weekday = 0;


global.mapconfig = {
    version: 'v1',
    config: {
      visState: {
        filters: [
             {
              "dataId": [
                "trip_data"
              ],
              "id": "filter_dropcluster",
              "name": [
                "cluster_dropoff"
              ],
              "type": "range",
              "value": [
                -1,
                50
              ],
              "enlarged": false,
              "plotType": "histogram",
              "yAxis": null
          },
          
          {
            "dataId": [
              "poi_data"
            ],
            "id": "filter_poi",
            "name": [
              "cluster"
            ],
            "type": "range",
            "value": [
              -1,
              50
            ],
            "enlarged": false,
            "plotType": "histogram",
            "yAxis": null
        } /* ,
        {
          "dataId": [
            "trip_data"
          ],
          "id": "filter_clusters",
          "name": [
            "clusters"
          ],
          "type": "multi-select",
          "enlarged": true
      }     */
        ],
        layers: [
          {
            "id": "drop_cluster",
            "type": "point",
            "config": {
              "dataId": "trip_data",
              "label": "dropoff",
              "color": [
                255,
                92,
                33
              ],
              "columns": {
                "lat": "dropoff_latitude",
                "lng": "dropoff_longitude",
                "altitude": null
              },
              "isVisible": true,
              "visConfig": {
                "radius": 3,
                "fixedRadius": false,
                "opacity": 0.99,
                "outline": false,
                "thickness": 2,
                "strokeColor": [
                  255,
                  92,
                  33
                ],
                "colorRange": {
                  "name": "Uber Viz Qualitative 4",
                  "type": "qualitative",
                  "category": "Uber",
                  "colors": [
                    "#12939A",
                    "#DDB27C",
                    "#88572C",
                    "#FF991F",
                    "#F15C17",
                    "#223F9A",
                    "#DA70BF",
                    "#125C77",
                    "#4DC19C",
                    "#776E57",
                    "#17B8BE",
                    "#F6D18A",
                    "#B7885E",
                    "#FFCB99",
                    "#F89570",
                    "#829AE3",
                    "#E79FD5",
                    "#1E96BE",
                    "#89DAC1",
                    "#B3AD9E"
                  ]
                },
                "strokeColorRange": {
                  "name": "Global Warming",
                  "type": "sequential",
                  "category": "Uber",
                  "colors": [
                    "#5A1846",
                    "#900C3F",
                    "#C70039",
                    "#E3611C",
                    "#F1920E",
                    "#FFC300"
                  ]
                },
                "radiusRange": [
                  1,
                  19.37
                ],
                "filled": true
              },
              "textLabel": [
                {
                  "field": null,
                  "color": [
                    255,
                    255,
                    255
                  ],
                  "size": 18,
                  "offset": [
                    0,
                    0
                  ],
                  "anchor": "start",
                  "alignment": "center"
                }
              ]
            },
            "visualChannels": {
              "colorField": {
                "name": "cluster_dropoff",
                "type": "integer"
              },
              "colorScale": "quantize",
              "strokeColorField": null,
              "strokeColorScale": "quantile",
              "sizeField": {
                "name": "radius_drop",
                "type": "real"
              },
              "sizeScale": "linear"
            }
          },
          {
            "id": "drop_icons",
            "type": "icon",
            "config": {
              "dataId": "trip_data",
              "label": "dropoff",
              "color": [
                255,
                92,
                33
              ],
              "columns": {
                "lat": "dropoff_latitude",
                "lng": "dropoff_longitude",
                "icon": "icon_drop"
              },
              "isVisible": false,
              "visConfig": {
                "radius": "dollar/m",
                "fixedRadius": false,
                "opacity": 0.99,
                "colorRange": {
                  "name": "Custom Palette",
                  "type": "custom",
                  "category": "Custom",
                  "colors": [
                    "#fff7ec",
                    "#fee8c7",
                    "#fee8c9",
                    "#fdd49e",
                    "#fdbb84",
                    "#fdbb86",
                    "#fc8d58",
                    "#ef6547",
                    "#ef6549",
                    "#7f0000"
                  ]
                },
                "radiusRange": [
                  1,
                  150
                ]
              },
              "textLabel": [
                {
                  "field": null,
                  "color": [
                    255,
                    255,
                    255
                  ],
                  "size": 18,
                  "offset": [
                    0,
                    0
                  ],
                  "anchor": "start",
                  "alignment": "center"
                }
              ]
            },
            "visualChannels": {
              "colorField": {
                "name": "min_bins",
                "type": "integer"
              },
              "colorScale": "quantize",
              "sizeField": {
                "name": "dollar/m",
                "type": "real"
              },
              "sizeScale": "sqrt"
            }
          },
          {
            "id": "pick_cluster",
            "type": "point",
            "config": {
              "dataId": "trip_data",
              "label": "pickup",
              "color": [
                255,
                92,
                33
              ],
              "columns": {
                "lat": "pickup_latitude",
                "lng": "pickup_longitude",
                "altitude": null
              },
              "isVisible": true,
              "visConfig": {
                "radius": 3,
                "fixedRadius": false,
                "opacity": 0.99,
                "outline": false,
                "thickness": 2,
                "strokeColor": [
                  255,
                  92,
                  33
                ],
                "colorRange": {
                  "name": "Uber Viz Qualitative 4",
                  "type": "qualitative",
                  "category": "Uber",
                  "colors": [
                    "#12939A",
                    "#DDB27C",
                    "#88572C",
                    "#FF991F",
                    "#F15C17",
                    "#223F9A",
                    "#DA70BF",
                    "#125C77",
                    "#4DC19C",
                    "#776E57",
                    "#17B8BE",
                    "#F6D18A",
                    "#B7885E",
                    "#FFCB99",
                    "#F89570",
                    "#829AE3",
                    "#E79FD5",
                    "#1E96BE",
                    "#89DAC1",
                    "#B3AD9E"
                  ]
                },
                "strokeColorRange": {
                  "name": "Global Warming",
                  "type": "sequential",
                  "category": "Uber",
                  "colors": [
                    "#5A1846",
                    "#900C3F",
                    "#C70039",
                    "#E3611C",
                    "#F1920E",
                    "#FFC300"
                  ]
                },
                "radiusRange": [
                  1,
                  1
                ],
                "filled": true
              },
              "textLabel": [
                {
                  "field": null,
                  "color": [
                    255,
                    255,
                    255
                  ],
                  "size": 18,
                  "offset": [
                    0,
                    0
                  ],
                  "anchor": "start",
                  "alignment": "center"
                }
              ]
            },
            "visualChannels": {
              "colorField": {
                "name": "cluster_pickup",
                "type": "integer"
              },
              "colorScale": "quantize",
              "strokeColorField": null,
              "strokeColorScale": "quantile",
              "sizeField": {
                "name": "radius_pick",
                "type": "real"
              },
              "sizeScale": "linear"
            }
          },

          {
            "id": "pick_icons",
            "type": "icon",
            "config": {
              "dataId": "trip_data",
              "label": "pickup",
              "color": [
                255,
                92,
                33
              ],
              "columns": {
                "lat": "pickup_latitude",
                "lng": "pickup_longitude",
                "icon": "icon_pick"
              },
              "isVisible": false,
              "visConfig": {
                "radius": "dollar/m",
                "fixedRadius": false,
                "opacity": 0.99,
                "colorRange": {
                  "name": "Custom Palette",
                  "type": "custom",
                  "category": "Custom",
                  "colors": [
                    "#fff7ec",
                    "#fee8c7",
                    "#fee8c9",
                    "#fdd49e",
                    "#fdbb84",
                    "#fdbb86",
                    "#fc8d58",
                    "#ef6547",
                    "#ef6549",
                    "#7f0000"
                  ]
                },
                "radiusRange": [
                  1,
                  150
                ]
              },
              "textLabel": [
                {
                  "field": null,
                  "color": [
                    255,
                    255,
                    255
                  ],
                  "size": 18,
                  "offset": [
                    0,
                    0
                  ],
                  "anchor": "start",
                  "alignment": "center"
                }
              ]
            },
            "visualChannels": {
              "colorField": {
                "name": "min_bins",
                "type": "integer"
              },
              "colorScale": "quantize",
              "sizeField": {
                "name": "dollar/m",
                "type": "real"
              },
              "sizeScale": "sqrt"
            }
          },
         
          {
            id: 'pois',
            type: "icon",
            config: {
              dataId: "poi_data",
              label: "POI",
              color: [
                31,
                186,
                214
              ],
              columns: {
                lat: "latitude",
                lng: "longitude",
                icon: "icon"
              },
              isVisible: true,
              visConfig: {
                radius: 5,
                fixedRadius: false,
                opacity: 0.8,
                radiusRange: [3,9]
            }
          },
          visualChannels:{
            "sizeField": {
              "name": "nRatings",
              "type": "integer"
            },
            "sizeScale": "sqrt"
          }
          },
          {
            id: 'subs',
            type: 'point',
            config: {
              dataId: 'subway',
              label: 'subway stations',
              columns: {
                lat: 'latitude',
                lng: 'longitude'
              },
              visConfig: {
                  radius: 7,
                  opacity: 1,
  
              },
              color: [255,0,0],
              isVisible: false
            }
          },     
          {
            id: 'lines',
            type: "line",
            config: {
              dataId: "trip_data",
              label: "pick->drop",
              color: [33,240,255],
              columns: {
                lat0: "pickup_latitude",
                lng0: "pickup_longitude",
                lat1: "dropoff_latitude",
                lng1: "dropoff_longitude"
              },
              isVisible: false,
              visConfig: {
                opacity: 0.8,
                thickness: 1,
                "colorRange": {
                  "name": "Uber Viz Qualitative 4",
                  "type": "qualitative",
                  "category": "Uber",
                  "colors": [
                    "#12939A",
                    "#DDB27C",
                    "#88572C",
                    "#FF991F",
                    "#F15C17",
                    "#223F9A",
                    "#DA70BF",
                    "#125C77",
                    "#4DC19C",
                    "#776E57",
                    "#17B8BE",
                    "#F6D18A",
                    "#B7885E",
                    "#FFCB99",
                    "#F89570",
                    "#829AE3",
                    "#E79FD5",
                    "#1E96BE",
                    "#89DAC1",
                    "#B3AD9E"
                  ]
                },
                sizeRange: [
                  0.1,
                  1
                ],
                targetColor: [255,92,33]
              },
  
            },
            visualChannels: {
              "colorField": {
                "name": "cluster_pickup",
                "type": "integer"
              },
              "colorScale": "quantize",
              "sizeField": {
                "name": "radius_pick",
                "type": "real"
              },
              "sizeScale": "linear"
            }
          }
  
        ],
        "interactionConfig": {
          "tooltip": {
            "fieldsToShow": {
              "trip_data": [
                "trip_distance",
                "pickup_time",
                "dropoff_time",
                "cluster_dropoff",
                "cluster_pickup",
                "passenger_count",
                "fare_amount",
                "weekday"
              ],
              "poi_data": [
                "name",
                "type",
                "nRatings",
                "cluster"
              ]
            },
            "enabled": true
          },
          "brush": {
            "size": 0.5,
            "enabled": false
          }
        }
      }
    }
  }

