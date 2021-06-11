import React, {Component} from 'react';
import * as d3 from 'd3';
import * as ReactFauxDOM from 'react-faux-dom';
import {
  cabdataset_all, poidataset_all,
  cabdataset_day, poidataset_day,
  cabdataset_end, poidataset_end} from '../data/import'
import Select from 'react-select';
import './global.js';

import clustercenter_all from '../data/clustercenter_all.js';
import clustercenter_day from '../data/clustercenter_day.js';
import clustercenter_end from '../data/clustercenter_end.js';


import './style.css';

class SideView extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedCluster: {
        value:null,
        label:"all",
        location: {
          latitude: 40.7632,
          longitude:  -73.9312,
          zoom: 11.1
      }},
      data: [],
      clusters: [],
      wkd: [],
      weekday: -1
    }
  }

  //variables for plots
  sideWidth;
  width;
  height;
  margin;  
  plotCanvas = [];

  domhandle;

  handleChange = selectedCluster => {
    this.setState({ selectedCluster });

    global.activeCluster = selectedCluster.value;
    //update position on map
    global.position = selectedCluster.location;
    //show pickup-dropoff lines
    if(selectedCluster.value > 0){
      global.linesActive = true;
    }
    else{
      global.linesActive = false;
    }

    //redraw plots
    this.redrawSidebar(selectedCluster) 
  };

  redrawSidebar(cluster){
    let {data,pois} = this.state;

    if(cluster.value){
      data = data.filter((el) => {
        return (el.cluster_dropoff === cluster.value || el.cluster_pickup === cluster.value);
      })   
      pois = pois.filter((el) => {
        return el.cluster === cluster.value;
      })
    }

    this.plotCanvas.forEach(element => {
      element.selectAll('*').remove();
    });


    //draw new stuff

    if(cluster.value){
      this.listPoi(this.plotCanvas[0],pois);
    }

    //this.drawBarchart(this.plotCanvas[1],"weekday",rawdata)
    this.drawWeekday(this.plotCanvas[1]);
    this.drawClockGlyph(this.plotCanvas[2],data)
    this.drawBarchart(this.plotCanvas[3],"passenger_count",data)
    this.drawDensity(this.plotCanvas[4],"trip_distance",data)
    this.drawDensity(this.plotCanvas[5],"fare_amount",data)
    
    
    this.props.animateFauxDOM(1000)
  }

  prepareData(){

    let{weekday} = this.state;

    let clusters = clustercenter_all;
    let nycTrips = cabdataset_all.data;
    let poiStr = poidataset_all.data;

    //change file here!
    switch (weekday) {
      case "day":
        clusters = clustercenter_day;
        nycTrips = cabdataset_day.data;
        poiStr = poidataset_day.data
        break;        
      case "end":
        clusters = clustercenter_end;
        nycTrips = cabdataset_end.data;
        poiStr = poidataset_end.data
        break;        
      default:
        console.log("default weekday")
        break;
    }

    
    let insert = {};
    let taxi = [];
    
    //get taxidata
    nycTrips.rows.forEach(row => {
      insert = {};
      for (let index = 0; index < row.length; index++) {
        insert[nycTrips.fields[index].name] = row[index];

        //get cluster values
        if(nycTrips.fields[index].name === "cluster_dropoff"){
          if(!clusters.find(function(c){ return c.value === row[index] })){
            //console.log(row[index],clustercenter[row[index]].lat,clustercenter[row[index]].lng)
            
          }
        }  
        if(nycTrips.fields[index].name === "cluster_pickup"){
          if(!clusters.find(function(c){ return c.value === row[index] })){
            clusters.push({
              value:row[index],
              label:row[index],
              location:{
                latitude: insert.pickup_latitude,
                longitude: insert.pickup_longitude,
                zoom: 16
            }})
          }
        }  
      }
      taxi.push(insert) 
    });


    let poi = [];
    //get poidata
    poiStr.rows.forEach(row => {
      insert = {}
      for (let index = 0; index < row.length; index++) {
        insert[poiStr.fields[index].name] = row[index];
      }
      poi.push(insert)

    })

    //calculate weekday percents
    let maxVal = 0;
    let wkd = [{key:'day',str:"day",val:0},{key:'end',str:"end",val:0},{key:-1,str:"all",val:taxi.length}]
    taxi.forEach(element => {
      let val = 0;
      if (element.weekday < 4)
        val = 0
      else
        val = 1
      wkd[val].val ++;
    })
    wkd = wkd.map(bar => {
      if((bar.val/taxi.length) > maxVal)
        maxVal = (bar.val/taxi.length)
      return {key:bar.key,str:bar.str,val:(bar.val/taxi.length)};
    })

    //mabye sort here according to mean daaytime
    clusters.sort((a, b) => (a.value > b.value) ? 1 : -1)


    let {selectedCluster} = this.state;

    this.setState({
      data: taxi,
      clusters: clusters,
      pois: poi,
      wkd: wkd
    },() =>{
      this.redrawSidebar(selectedCluster)
    });


  }

  componentDidMount(){

    this.sideWidth = document.getElementById('dataviz').getBoundingClientRect().width;
    this.height = 160;
    this.width = this.sideWidth*0.6;
    this.margin = {
      side: this.sideWidth*0.2,
      up: 20
    }

    this.prepareData();
    this.domhandle = d3.select(this.props.connectFauxDOM('div','viz'));
    this.domhandle.attr("id","plotarea").style('height','100%').style('width','100%');

    let c0 = this.domhandle.append('div').attr('class',"poilist").attr('id','poilist').style('display','flex').style('justify-content','center');
    let domsvg = this.domhandle.append('svg').style('width','100%').style('height',(20*this.margin.up + 4.5*this.height) + 'px')
      
    let c1 = domsvg.append('g').attr('class','plot').attr('id','plot1').style("transform","translate("+ this.margin.side + "px," + this.margin.up + "px)")
    let c2 = domsvg.append('g').attr('class','plot').attr('id','plot2').style("transform","translate("+ this.margin.side + "px," + (4*this.margin.up + 0.5*this.height) + "px)")
    let c3 = domsvg.append('g').attr('class','plot').attr('id','plot3').style("transform","translate("+ this.margin.side + "px," + (8*this.margin.up + 1.5*this.height) + "px)")
    let c4 = domsvg.append('g').attr('class','plot').attr('id','plot4').style("transform","translate("+ this.margin.side + "px," + (12*this.margin.up + 2.5*this.height) + "px)")
    let c5 = domsvg.append('g').attr('class','plot').attr('id','plot5').style("transform","translate("+ this.margin.side + "px," + (16*this.margin.up + 3.5*this.height) + "px)")


    this.plotCanvas.push(c0)
    this.plotCanvas.push(c1)
    this.plotCanvas.push(c2)
    this.plotCanvas.push(c3)
    this.plotCanvas.push(c4)
    this.plotCanvas.push(c5)
    
 }

  listPoi(div, pois){
    let tbl = div.append('table').style('color',"#1fbad6").style('margin-bottom','2em').style('width','90%')
    let tbldat = {
      head: tbl.append('thead'),
      body: tbl.append('tbody')
    }

    let head = tbldat.head.append('tr');

    head.append('td').html("POI").style('text-align','right').style('padding-right','0.5em').style('border-bottom','1px solid #ff5c21').style('font-weight','bold');
    head.append('td').html("Type").style('text-align','left').style('padding-left','0.5em').style('border-bottom','1px solid #ff5c21').style('font-weight','bold');

    pois.forEach((el) => {
      let r = tbldat.body.append('tr').attr('class','poirow');
      r.append('td').html(el.name).style('text-align','right').style('padding','0 0.5em')
      r.append('td').html(el.type).style('text-align','left').style('padding','0 0.5em')
    })



  }

  drawWeekday(canvas){

    let vals = {};
    let {wkd, weekday} = this.state;

    vals = {name:"all",color:"#d6531f",data:wkd}

    //heading
    let head = canvas.append("g").attr("class","pHead");

    head.append("text")
      .attr("class","cyan")
      .text("select weekdays")
      .attr("x",this.width/2)
      .attr("font-family","arial")
      .attr("y",0)
      .style("text-anchor","middle")

     //draw 3 rects
    let rwidth = this.width/3;
    canvas.selectAll('rect')
      .data(vals.data).enter()
      .append('rect')
      .attr('id',(d) => {return ('wkd' + d.key)})
      .attr('x',(d,i) => {
        return rwidth*i})
      .attr('y', this.margin.up)
      .attr('width', rwidth)
      .attr('height', rwidth)
      //.style('fill','#1fbad6')
      .style('fill', d => {
        if(d.key === weekday)
          return "rgb(214, 83, 31)";
        else return "#1fbad6";
      })
      .style('stroke-width','2.5')
      .style('opacity',(d) => {
        if(d.key === weekday)
          return 0.25;
        else return 0.25;
      })
      .on('mouseover', function(d){
        
        d3.select('#wkd'+d.key).style('stroke','#d6531f')
      })
      .on('mouseout', function(d){
        d3.select('#wkd'+d.key).style('stroke','none')
      })
      .on('click',(d,i) => {    
        this.setState({
          weekday: d.key,
          selectedCluster:  {
            value:null,
            label:"all",
            location: {
              latitude: 40.7632,
              longitude:  -73.9312,
              zoom: 11.1
          }}
        }, () => {
          let {selectedCluster} = this.state;
          global.linesActive = false;
          console.log("change from sideview", d.key)
          global.position = selectedCluster.location;
          global.weekday = d.key;
          this.prepareData();
          this.redrawSidebar(selectedCluster);
        });      
      })

      //add text % percentage
    let txt = canvas.selectAll('text.wkd')
      .data(vals.data).enter()
      .append('text')
      .attr('class','wkd')
      .attr('x', (d,i) =>{
        return ((rwidth/2) + rwidth*i)})
      .attr('y', 1.5*this.margin.up)
 
    txt.append('tspan')
      .attr('x',(d,i) =>{
        return ((rwidth/2) + rwidth*i)})
      .attr('dy', '0')
      .text((d) => {return d.str})
      .style("text-anchor","middle")
      .style('alignment-baseline','hanging')
      .style('font-size', rwidth*0.3)
      .style('fill','#d6531f')
      .style('pointer-events','none')
    txt.append('tspan')
      .attr('x',(d,i) =>{return ((rwidth/2) + rwidth*i)})
      .attr('dy', rwidth/2)
      .text((d) => {return Number.parseFloat(d.val*100).toFixed(0) + "%"})
      .style("text-anchor","middle")
      .style('alignment-baseline','hanging')
      .style('font-size', rwidth*0.28)
      .style('fill','#d6531f')
      .style('pointer-events','none')
   
  }

  drawClockGlyph(canvas,cdata){
    //aggregate data into 24 bins (1 bin for each hour)
    var radialLineGenerator = d3.radialLine();
    let max = 0;
    let plotsize = this.height*0.45;
    
    const binByAttr = (data,attribute) => {
      //theshholds for binning the data by the hour
      let thresh = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
      //binning for pickups
      var histogram = d3.histogram().value(d => {return d[attribute].substring(0,2)}).thresholds(thresh)
      var bins = histogram(data)
      var pts = [];
      let idx = 0;
      bins.forEach(hour => {      
        let rotation = (idx/bins.length) * 2*Math.PI;
        pts.push([rotation,(hour.length/data.length)])
        if((hour.length/data.length) > max)
          max = (hour.length/data.length)
        idx++;
      })
      //duplicate first point to close loop
      pts.push([2*Math.PI,(bins[0].length/data.length)])
  
      return pts;
    }



    let lines = [];

    let {data} = this.state;
    //get linedata for entire dataset
    lines.push({
      name:"dropoff all",
      fill:"rgb(255,92,33)",
      stroke:"none",
      opacity: 0.4,
      pts:binByAttr(data,"dropoff_time")})
    lines.push({
      name:"pickup all",
      fill:"rgb(33,240,255)",
      stroke:"none",
      opacity: 0.4,
      pts:binByAttr(data,"pickup_time")})

    
    lines.push({
      name:"dropoff",
      fill:"none",
      stroke:"rgb(255,92,33)",
      opacity: 1,
      pts:binByAttr(cdata,"dropoff_time")})
    lines.push({
      name:"pickup",
      fill:"none",
      stroke:"rgb(33,240,255)",
      opacity:"1",
      pts:binByAttr(cdata,"pickup_time")})
    

    var scale = (plotsize*0.9)/max;
    //scale points to maximize visualization area
    lines.forEach(line => {
      line.pts.forEach(point =>{
        point[1] = point[1] * scale
      })
      line.path = radialLineGenerator(line.pts); 
    })

    
    
    //heading
    let head = canvas.append("g").attr("class","pHead");

    head.append("text")
      .attr("class","cyan")
      .text("Pickup & Dropoff Times")
      .attr("x",this.width/2)
      .attr("font-family","arial")
      .attr("y",-this.margin.up/3)
      .style("text-anchor","middle")


    //draw circles for orientaion
    let rads = [{r:plotsize/4},{r:plotsize/2},{r:3*plotsize/4},{r:plotsize}]
    
    let cs = canvas.append('g')
      .attr('class','circs')
      .style("transform", "translate(" + this.width/2 +"px," + this.height/2 +"px)")

    cs.selectAll('circle')
      .data(rads).enter()
      .append('circle')
      .attr('cx',0)
      .attr('cy',0)
      .attr('r',d => {return d.r})
      .style("fill","none")
      .style("stroke","gray")

    //lines of glyph  
    cs.append('line')
      .attr("x1",0)  
      .attr("y1",-plotsize)  
      .attr("x2",0)  
      .attr("y2",plotsize)
      .style("fill","none")
      .style("stroke","gray")

    cs.append('line')
      .attr("x1",-plotsize)  
      .attr("y1",0)  
      .attr("x2",plotsize)  
      .attr("y2",0)
      .style("fill","none")
      .style("stroke","gray")

    //text to indicate hours
    cs.append('text')
      .attr("x",0)
      .attr("y",-plotsize*1.02)
      .attr("font-size",plotsize*0.12)
      .attr("text-anchor","middle")
      .attr("alignment-baseline","baseline")
      .style("fill","gray")
      .text("0")

    cs.append('text')
      .attr("x",plotsize*1.02)
      .attr("y",0)
      .attr("font-size",plotsize*0.12)
      .attr("text-anchor","start")
      .attr("alignment-baseline","middle")
      .style("fill","gray")
      .text("6")

    cs.append('text')
      .attr("x",0)
      .attr("y",plotsize*1.02)
      .attr("font-size",plotsize*0.12)
      .attr("text-anchor","middle")
      .attr("alignment-baseline","hanging")
      .style("fill","gray")
      .text("12")

    cs.append('text')
      .attr("x",-plotsize*1.02)
      .attr("y",0)
      .attr("font-size",plotsize*0.12)
      .attr("text-anchor","end")
      .attr("alignment-baseline","middle")
      .style("fill","gray")
      .text("18")

    //draw the lines  
    let ls = canvas.append('g')
      .style("transform", "translate(" + this.width/2 +"px," + this.height/2 +"px)")
    ls.selectAll('path').data(lines).enter()
      .append('path')
      .attr('class','histobar')
      .attr('d', d =>{ return d.path})
      .style('fill',d => {return d.fill})
      .style('stroke', d => {return d.stroke})
      .style('opacity',d => {return d.opacity})
      .style('stroke-width',"2px")

    let leg = canvas.append('g')
      .attr('class',"legend")
      .style('transform', 'translate(' + this.width*0.95 + 'px,0)')
      .style('transition','transform 0.2s ease-out')

    for(let id= lines.length-1;id >= (lines.length-2) ; id--){

      //draw legend
      let boxSize = this.height*0.065;

      leg.append('rect')
        .attr('x',0)
        .attr('y',(id%2)*boxSize)
        .attr('width',boxSize)
        .attr('height',boxSize)
        .style('fill', lines[id].stroke)

      leg.append('text')
        .attr('y',(id%2)*boxSize+ boxSize*0.5)
        .attr('x',-boxSize*0.15)
        .attr('text-anchor',"end")
        .attr('fill',lines[id].stroke)
        .attr("alignment-baseline","middle")
        .attr('font-size',boxSize)
        .text(lines[id].name)
    }
      

  }

    

  drawBarchart(canvas,attribute,cdata){

    let maxVal = 0;
    let vals = [];

    const getBars = (data,attribute) => {
      let processed = [];
      data.forEach(element => {
        let val = element[attribute];
        //excludes -1 value for clusters
        if(val > 0){    
          if(!processed[val])
            processed[val] = 1;
          else{
            processed[val]++;
          }
        }
      });
      //normalize to %
      processed = processed.map(bar =>{

        if((bar/data.length) > maxVal)
          maxVal = (bar/data.length);
        return (bar/data.length);
        });
      return processed;
    }

    let {data,rawdata} = this.state;

    if(attribute === "weekday")
      vals.push({name:"all",color:"#d6531f",data:getBars(rawdata,attribute)})
    else
      vals.push({name:"all",color:"#d6531f",data:getBars(data,attribute)})
    
    vals.push({name:"cluster",color:"#1fbad6",data:getBars(cdata,attribute)})

    let nItems = Object.keys(vals[0].data).length
    
    //heading
    let head = canvas.append("g").attr("class","pHead");

    head.append("text")
      .attr("class","cyan")
      .text(attribute)
      .attr("x",this.width/2)
      .attr("font-family","arial")
      .attr("y",-this.margin.up/2)
      .style("text-anchor","middle")

    //create scales
    const yScale = d3.scaleLinear()
      .range([this.height, 0])
      .domain([0, maxVal])

    canvas.append('g')
      .attr("class","axis")
      .call(d3.axisLeft(yScale)
        .tickFormat(d3.format(".0%")));


    const xScale = d3.scaleBand()
      .range([0, this.width])      
      .domain([...Array(nItems).keys()].map(x => ++x))
      .padding(0.2)

    canvas.append('g')
      .attr("class","axis")
      .style('transform', 'translate(0, '+ this.height +'px)')
      .call(d3.axisBottom(xScale));


    //add bars
    let bars = canvas.append('g').attr("class","bars")

    let leg = bars.append('g')
      .attr('class',"legend")
      .style('transform', 'translate(' + this.width*0.95 + 'px,0)')
      .style('transition','transform 0.2s ease-out')

    vals.forEach((val,id) => {
      
      for (const key in val.data) {
          bars.append('rect')
            .attr("class","histobar" + id + " " + attribute)
            .attr('x', xScale(key) + id*(xScale.bandwidth()/2))
            .attr('y', yScale(val.data[key]))
            .attr('height', (this.height - yScale(val.data[key])))
            .attr('width', xScale.bandwidth()/2)
            .style('fill', val.color);
            

        }


      //draw legend
      let boxSize = this.height*0.065;

      leg.append('rect')
        .attr('x',0)
        .attr('y',id*boxSize)
        .attr('width',boxSize)
        .attr('height',boxSize)
        .style('fill', val.color)

      leg.append('text')
        .attr('y',id*boxSize+ boxSize*0.5)
        .attr('x',-boxSize*0.15)
        .attr('text-anchor',"end")
        .attr('fill',val.color)
        .attr("alignment-baseline","middle")
        .attr('font-size',boxSize)
        .text(val.name)

      });

      
  }

  drawHistogram(data,canvas,attribute){

    //heading
    let head = canvas.append("g").attr("class","pHead");

    head.append("text")
    .attr("class","cyan")
    .text(attribute)
    .attr("x",this.width/2)
    .attr("font-family","arial")
    .attr("y",-this.margin.up/2)
    .style("text-anchor","middle")
    

    let xS = d3.scaleLinear()
      .domain(d3.extent(data, function(d){
        return d[attribute];
    }))
      .range([0,this.width])

    canvas.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(xS)
        //TODO: dynamically get number of ticks depending on dataset
        .ticks(5)        
        );

    var passengerHistogram = d3.histogram()
      .value(function(d) { return d[attribute]; })   // I need to give the vector of value
      .domain(xS.domain())  // then the domain of the graphic
      .thresholds(xS.ticks(d3.max(data, function(d){ return d[attribute];}))); // then the numbers of bins

    var bins = passengerHistogram(data);
//      console.log("bins:",bins)
    // Y axis: scale and draw:
    var yS = d3.scaleLinear()
      .range([this.height, 0]);
      yS.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously

    canvas.append("g")
      .attr('class','axis')
      .call(d3.axisLeft(yS));

    let bars = canvas.append("g").attr("class","data")

    // append the bar rectangles to the svg element
    bars.selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
      .attr("x", 1)
      .attr("class","densityLine")
      .attr("transform", function(d) { return "translate(" + xS(d.x0) + "," + yS(d.length) + ")"; })
      .attr("width", function(d) { return xS(d.x1) - xS(d.x0) -1 ; })
      .attr("height", (d) => { return (this.height - yS(d.length)); })
  }


  drawDensity(canvas,attribute,cdata){

    let {data} = this.state;

    let dens = [];

    // add the x Axis
    var x = d3.scaleLinear()
    .domain([0,d3.max(data, d => {return d[attribute]})] //BAD THING
/*       d3.extent(data, function(d){
      return d[attribute];
    })
 */    )
    .range([0, this.width]);
    

    var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(100))
  
    dens.push({name:"all",color:"rgb(255,92,33)",kde:kde( data.map(function(d){  return d[attribute]; }))})


    // Compute kernel density estimation
    dens.push({name:"cluster",color:"rgb(33,240,255)",kde:kde( cdata.map(function(d){  return d[attribute]; }))})
    
    //heading
    let head = canvas.append("g").attr("class","pHead");
    
    head.append("text")
    .attr("class","cyan")
    .text(attribute)
    .attr("x",this.width/2)
    .attr("font-family","arial")
    .attr("y",-this.margin.up/2)
    .style("text-anchor","middle")
    

    canvas.append("g")        
      .attr('class','axis')
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x));

    // add the y Axis
    var y = d3.scaleLinear()
      .range([this.height, 0])
      // TODO: make domain dynamic accodring to datavalues
      .domain([0, 0.1]);

    canvas.append("g")
      .attr('class','axis')
      .call(d3.axisLeft(y));

    let graph = canvas.append("g").attr("class","data")
    let leg = graph.append('g')
    .attr('class',"legend")
    .style('transform', 'translate(' + this.width*0.95 + 'px,0)')
    .style('transition','transform 0.2s ease-out')


    dens.forEach((den,id) => {
      // Plot the area
      graph.append("path")
        .attr("class", "histobar")
        .datum(den.kde)
        .attr("opacity", ".8")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .style('fill', 'none')
        .style('stroke',den.color)
        .attr("d",  d3.line()
        .curve(d3.curveBasis)
        .x(function(d) { return x(d[0]); })
        .y(function(d) { return y(d[1]); }));

            //draw legend
      let boxSize = this.height*0.065;

      leg.append('rect')
        .attr('x',0)
        .attr('y',id*boxSize)
        .attr('width',boxSize)
        .attr('height',boxSize)
        .style('fill', den.color)

      leg.append('text')
        .attr('y',id*boxSize+ boxSize*0.5)
        .attr('x',-boxSize*0.15)
        .attr('text-anchor',"end")
        .attr('fill',den.color)
        .attr("alignment-baseline","middle")
        .attr('font-size',boxSize)
        .text(den.name)


    })




    // Function to compute density
    function kernelDensityEstimator(kernel, X) {
      return function(V) {
        return X.map(function(x) {
          return [x, d3.mean(V, function(v) { return kernel(x - v); })];
        });
      };
    }

    function kernelEpanechnikov(k) {
      return function(v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
      };
    }

  }
  
  
  render() {
    const { selectedCluster } = this.state;
    return (
      <div className="side">
          <h1 className="heading">Trip Details</h1>
          <div className="r" >
            <Select className="selector"
              value={selectedCluster}
              onChange={this.handleChange}
              options={this.state.clusters}
            />
            Select Cluster
          </div>
          <div id="dataviz" >{this.props.viz}</div>
      </div>
    );
  }
}

SideView.defaultProps = {
  viz: 'loading'
}

//export default connect(mapStateToProps, dispatchToProps)(SideView);
export default ReactFauxDOM.withFauxDOM(SideView)