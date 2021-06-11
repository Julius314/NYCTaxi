import React, {Component} from 'react';
import {connect} from 'react-redux';
import KeplerGl from 'kepler.gl';
import window from 'global/window';
import {addDataToMap, updateMap, layerConfigChange, layerVisConfigChange, setFilter} from 'kepler.gl/actions';
//import nycTrips from '../data/sampledata';
import subway from '../data/subway';
import './global.js'  
import {
  cabdataset_all, poidataset_all,
  cabdataset_day, poidataset_day,
  cabdataset_end, poidataset_end} from '../data/import'
  


import './style.css'


let width = window.innerWidth*0.999;
let height = window.innerHeight*0.999;
let token = "pk.eyJ1IjoianVsaXVzOCIsImEiOiJjazMzZHQyaTQwYjQzM2dueWRsazZuc2dwIn0.dc5SfV89V_2i6modk1FRAA"

class Map extends Component {
  constructor(props){
    super(props);
    this.state = {
      position: {},
      linesActive: false,
      activeCluster:null,
      zoom:11.1,
      weekday:"all"
    }
  }

  componentDidUpdate(prevProps){


    //weekday change -> reload dataset
    if(this.state.weekday !== global.weekday){
      this.setState({weekday: global.weekday}, () => {
        
        let dsets = [cabdataset_all,poidataset_all];
        console.log("map weekday: ",this.state.weekday)
        switch (this.state.weekday) {
          case "day":
            console.log("only show day")
            dsets = [cabdataset_day,poidataset_day];
            break;
          case "end":
            console.log("only show end")
            dsets = [cabdataset_end,poidataset_end];
            break;        
          default:
            dsets = [cabdataset_all,poidataset_all];
            console.log("default shit")
            break;
        }
        
        this.props.dispatch(
        addDataToMap({
          datasets: dsets
        }
        ))
      })
    }

    //cluster value changed -> move to cluster center
    if(this.state.activeCluster !== global.activeCluster){
      this.setState({activeCluster: global.activeCluster}, () => {
        //console.log("cluster different");
        if(this.state.activeCluster){
          let m = -1;
          if(this.props.keplerGl.map.mapState.zoom < 16)
            m = this.state.activeCluster;
          
            this.props.dispatch(setFilter(0,"value",[m,this.state.activeCluster]));
            this.props.dispatch(setFilter(1,"value",[this.state.activeCluster,this.state.activeCluster]));
        }
        else{
          this.props.dispatch(setFilter(0,"value",[-1,40]));
          this.props.dispatch(setFilter(1,"value",[-1,40]));
                    
        /*  this.props.dispatch(layerVisConfigChange(
            this.props.keplerGl.map.visState.layers.filter(function(c){ return c.id === "drop_cluster" })[0],
            {radiusRange: [1, 19.37], radius: 19.37}
          ));
          this.props.dispatch(layerVisConfigChange(
            this.props.keplerGl.map.visState.layers.filter(function(c){ return c.id === "pick_cluster" })[0],
            {radiusRange: [1, 19.37], radius: 19.37}
          ));
            */
        }

        //turn off lines 
        this.props.dispatch(layerConfigChange(
          this.props.keplerGl.map.visState.layers.filter(function(c){ return c.id === "lines" })[0],
          {isVisible:false}))

        this.moveTo(global.position)

      })
    }    

    //detect zoom change
    //detect only change between level where lines on or off
    if(this.props.keplerGl.map.mapState.zoom!==global.zoom){
      //determine the right state
      //determine if state changed
      let {activeCluster} = this.state;
      let currentZoom = this.props.keplerGl.map.mapState.zoom
      //console.log("globalzoom", global.position.zoom,"mapstatezoom",this.props.keplerGl.map.mapState.zoom,activeCluster)
      let thr = 15.9

            // Map the zoom range and the radius range
            let minZoom = 10
            let minZoomIcon = 16
            let maxZoom = 19
            let minRadius = 0.5
            let maxRadius = 19.37
            let R = (minRadius - maxRadius) / (maxZoom - minZoom)
            let newRadius = ((currentZoom - minZoom) * R) + maxRadius
      
            let RIcon = (minRadius - maxRadius) / (maxZoom - minZoomIcon)
            let newRadiusIcon = ((currentZoom - minZoomIcon) * RIcon) + maxRadius
            
            //minRadius = 1;
            if(newRadius <= 0.5){
              newRadius = 0.5;
              minRadius= 0.1;
            }
            if(newRadiusIcon <= 0.5){
              newRadiusIcon = 0.5
              minRadius = 0.1
            }


      //zoomed into new 
      if (currentZoom > thr && global.zoom <= thr){
        //turn on icons
        this.layerChange("drop_cluster",{isVisible: false})
        this.layerChange("drop_icons",{isVisible: true})
        this.layerChange("pick_cluster",{isVisible: false})
        this.layerChange("pick_icons",{isVisible: true})
        this.layerChange("lines",{isVisible:false})

        //show all datapoints & pois of cluster
        this.props.dispatch(setFilter(0,"value",[-1,30]));
        this.props.dispatch(setFilter(1,"value",[this.state.activeCluster,this.state.activeCluster]));

      }
      //zoomed out
      else if (currentZoom <= thr && global.zoom > thr){
        //turn on points
        this.layerChange("drop_cluster",{isVisible: true})
        this.layerChange("drop_icons",{isVisible: false})
        this.layerChange("pick_cluster",{isVisible: true})
        this.layerChange("pick_icons",{isVisible: false})
        this.layerChange("lines",{isVisible:false})

        //turn on lines if cluster value is selected
        if(activeCluster > 0){
          this.layerChange("lines",{isVisible: true})
  
          //show only cluster points
          this.props.dispatch(setFilter(0,"value",[this.state.activeCluster,this.state.activeCluster]));
        //  this.props.dispatch(setFilter(1,"value",[this.state.activeCluster,this.state.activeCluster]));

          
        this.props.dispatch(layerVisConfigChange(
          this.props.keplerGl.map.visState.layers.filter(function(c){ return c.id === "drop_cluster" })[0],
          {radiusRange: [newRadius, newRadius], radius: newRadius}
        ));
  
        }else{
          //show all datapoints & pois
          this.props.dispatch(setFilter(0,"value",[-1,30]));
          this.props.dispatch(setFilter(1,"value",[-1,30]));

          
        this.props.dispatch(layerVisConfigChange(
          this.props.keplerGl.map.visState.layers.filter(function(c){ return c.id === "drop_cluster" })[0],
          {radiusRange: [1, newRadius], radius: newRadius}
        ));

        }
      } 

      if(currentZoom < thr) {
        if(activeCluster > 0){
          this.props.dispatch(layerVisConfigChange(
            this.props.keplerGl.map.visState.layers.filter(function(c){ return c.id === "drop_cluster" })[0],
            {radiusRange: [newRadius, newRadius], radius: newRadius}
          ));
        } else {
          this.props.dispatch(layerVisConfigChange(
            this.props.keplerGl.map.visState.layers.filter(function(c){ return c.id === "drop_cluster" })[0],
            {radiusRange: [1, newRadius], radius: newRadius}
          ));
        }
      } else {
      

      this.props.dispatch(layerVisConfigChange(
        this.props.keplerGl.map.visState.layers.filter(function(c){ return c.id === "drop_icons" })[0],
        {radiusRange: [minRadius, newRadiusIcon], radius: newRadiusIcon}
      ));


      this.props.dispatch(layerVisConfigChange(
        this.props.keplerGl.map.visState.layers.filter(function(c){ return c.id === "pick_icons" })[0],
        {radiusRange: [minRadius, newRadiusIcon], radius: newRadiusIcon}
      ));

      }
      
      global.zoom = this.props.keplerGl.map.mapState.zoom;

    }
  }
  
  componentDidMount(){
    this.props.dispatch(
      addDataToMap({
        datasets: [cabdataset_all,poidataset_all,
          {
          info: {
            label: 'Subway Stations',
            id: 'subway'
          },
          data: subway
          }
        ],
        option: {
          centerMap: true,
          readOnly: true,
          keepExistingConfig: false
        },
        config: global.mapconfig
      })
    );

    //default starting location
    this.props.dispatch(
      updateMap(
        {
          latitude: 40.7632,
          longitude: -73.9312,
          zoom: 11.1
        }
      )
    );

    //console.log("position prop: ",this.props.position)
    //console.log("global", global.position);

  }

  render(){  
    
    return(
      <KeplerGl
          id="map"
          mapboxApiAccessToken={token}
          width={width}
          height={height}
          />
    ) 
  }

  layerChange(lid,val) {
    this.props.dispatch(layerConfigChange(
      this.props.keplerGl.map.visState.layers.filter(function(c){ return c.id === lid })[0],
      val
    ));
  }

  moveTo(mapPos){
  //  console.log("moving to different location on map");
    this.props.dispatch(
      updateMap(
        mapPos
      )
    );
  }
}

const mapStateToProps = state => state;
const dispatchToProps = dispatch => ({dispatch});

export default connect(mapStateToProps, dispatchToProps)(Map);
