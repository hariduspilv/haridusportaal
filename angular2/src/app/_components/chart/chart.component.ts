import { Component, Input, OnInit } from "@angular/core";
import { HttpService } from '@app/_services/httpService';

@Component({
  selector: "chart",
  templateUrl: "chart.template.html",
  styleUrls: ["chart.styles.scss"]
})

export class ChartComponent implements OnInit{
  @Input() data;
  @Input () type = 'default';

  chartData:any = [];

  objectKeys = Object.keys;

  filters:any = {};

  filtersData:any = {};

  graphOptions = {
    height: 400,
    pieSliceTextStyle: {
      "color": '#ffffff'
    },
    curveType: "function",
    lineWidth: 5,
    pointsVisible: true,
    pointSize: 12,
    legend: { position: 'top', maxLines: 3 },
    colors: ['#18218F', '#9E02B6', '#0252B0', '#C200C2', '#0071C7', '#D704A2', '#198294', '#D11B6F', '#00856A', '#D11B1B', '#257E25', '#DB3A00'],
    animation:{
      duration: 1000,
      easing: 'out',
      startup: true //This is the new option
    }
  }

  dataUrl = '/graphql?queryName=googleChartData&queryId=4fc7afde3daa640f0770a826ec2df3015af1b019:1&variables=';

  /*{
    chartType: 'ColumnChart',
    dataTable: [
      ['Task', 'Hours per Day'],
      ['Work',     11],
      ['Eat',      2],
      ['Commute',  2],
      ['Watch TV', 2],
      ['Sleep',    7]
    ],
    options: {'title': 'Tasks'},
  };*/

  constructor(
    private http: HttpService
  ) {

  }

  capitalize = function(input) {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  compileData(inputData:any = false) {

    var output = [];

    let data = inputData || this.data;

    for( let i in data ){
      let current = data[i];
      let value = JSON.parse( current.value );
      let graphVAxis = current.graphVAxis;
      let chartType = this.capitalize(current.graphType);
      let graphIndicator = current.graphIndicator;
      let graphTitle = current.graphTitle;
      let secondaryGraphType = current.secondaryGraphType;


      if( chartType == "Doughnut" ){
        chartType = "Pie";
      }

      let graphName = chartType+"Chart";
      
      if( chartType && secondaryGraphType ){
        graphName = "ComboChart"
      }

      let tmp = {
        chartType: graphName,
        dataTable: value,
        options: { ... this.graphOptions }
      }

      tmp.options['title'] = graphTitle;



      if( graphName == "ComboChart" ){
        tmp['options']['colors'] = ["#18218f", "#db3a00"];
      }

      if( graphName == "BarChart" ){

        if( current.graphIndicator || current.secondaryGraphIndicator){
          tmp['options']['hAxes'] = {};
          if( current.graphIndicator ){
            tmp['options']['hAxes'][0] = {'title': current.graphIndicator};
          }
          if( current.secondaryGraphIndicator ){
            tmp['options']['hAxes'][1] = {'title': current.secondaryGraphIndicator};
          }
        }
      }else{
        if( current.graphIndicator || current.secondaryGraphIndicator){
          tmp['options']['vAxes'] = {};
          if( current.graphIndicator ){
            tmp['options']['vAxes'][0] = {'title': current.graphIndicator};
          }
          if( current.secondaryGraphIndicator ){
            tmp['options']['vAxes'][1] = {'title': current.secondaryGraphIndicator};
          }
        }
      }

      if( current.graphType == "doughnut" ){
        tmp.options['pieHole'] = 0.4;
      }

      if( chartType && secondaryGraphType ){
        let newType = chartType;

        if( newType == "Bar" ){
          newType = "bars";
        }

        if( secondaryGraphType == "bar" ){
          secondaryGraphType = "bars";
        }
        
        tmp.options['seriesType'] = newType;

        tmp.options['series'] = {
          0: {
            targetAxisIndex: 0
          },
          1: {
            type: secondaryGraphType,
            targetAxisIndex: 1
          }
        }
    
      }
      
      output.push(tmp);

    }


    if( inputData ){
      return output[0];
    }else{
      this.chartData = output;
    }


  }

  generateID( length = 10 ) {
    let str = '';
    for( let i = 0; i < length; i++ ){
      str+= (Math.random() * 36).toString(36).substr(2,1);
    }
    return str;
  }

  parseData() {

    this.data = this.data.map( ( item ) => {
      item.filterValues = JSON.parse( item.filterValues );
      item.id = this.generateID();

      this.filters[ item.id ] = {};

      try{
        let tmpFilters = [];

        for( let i in item.filterValues.graph_options.graph_filters ){
          let current = item.filterValues.graph_options.graph_filters[i];

          let options = [];

          for( let o in current ){
            options.push(current[o]);
          };

          tmpFilters.push(
            {
              key: i,
              options: options
            }
          );
        }
        item.filters = tmpFilters;

      }catch(err){
        console.error("Couldn't parse filters!");
      }

      try{
        let options = [];

        for( let i in item.filterValues.graph_options.graph_indicator ){
          options.push(item.filterValues.graph_options.graph_indicator[i]);
        }

        item.filters.push({
          key: 'näitaja',
          options: options
        });

        this.filters[ item.id ]['näitaja'] = item.filters[ item.filters.length - 1 ].options[0];

        console.log(item.filters);
        console.log(this.filters);

      }catch(err){
        console.error("Couldn't parse indicators!");
      }

      this.getGraphData( item.id );

      return item;

    });

  }

  getGraphData( id ) {

    let current = this.data.filter( (item) => {
      if( id == item.id ){
        return item;
      }
    })[0];

    let filters = this.filters[current.id];

    if( !this.filtersData[current.id] ){ this.filtersData[current.id] = {}; }
    this.filtersData[current.id].loading = true;

    let variables = {
      graphSet: current['graphSet'],
      graphType: current['graphType'],
      secondaryGraphType: '',
      graphGroupBy: '',
      indicator: filters['näitaja'],
      secondaryGraphIndicator: '',
      oskaField: filters.valdkond || '',
      oskaSubField: filters.alavaldkond || '',
      oskaMainProfession: filters.ametiala || '',
      period: filters.periood || '',
      label: filters.silt || ''
    }

    let tmpVariables = {};

    for( let i in variables ){
      if( variables[i] !== ''){
        tmpVariables[i] = variables[i];
      }
    }

    let subscription = this.http.get( this.dataUrl + JSON.stringify( tmpVariables ) ).subscribe( (response) => {
      let data = response['data'].GoogleChartQuery.map( (item) => {
        return {
          graphType: variables['graphType'],
          graphIndicator: 'Mis ma siia panen? :O',
          graphTitle: current.graphTitle,
          graphSet: variables['graphSet'],
          value: item.ChartValue,
          secondaryGraphType:	null,
          secondaryGraphIndicator:	null
        }
      });

      this.filtersData[current.id] = this.compileData( data );

      subscription.unsubscribe();
      this.filtersData[current.id].loading = false;
    }, function(err){
      this.filtersData[current.id].loading = false;
    });
  }

  ngOnInit() {

    switch( this.type ){
      case 'filter': {
        this.parseData();
        break;
      }
      default: {
        this.compileData();
      }
    }
  }
}
