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

  requestDebounce = {};
  requestSubscription = {};

  graphOptions = {
    height: 400,
    pieSliceTextStyle: {
      "color": '#ffffff'
    },
    tooltip: {
      format: '####'
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
      startup: true
    }
  }

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
      let isStacked:any = false;
      let seriesType:any = false;

      if( chartType == "Doughnut" ){
        chartType = "Pie";
      }

      switch( chartType.toLowerCase() ){
        case 'clustered bar' : {
          isStacked = false;
          chartType = "Bar";
          seriesType = 'bars';
          break;
        }
        case 'clustered column' : {
          isStacked = false;
          chartType = "Column";
          seriesType = 'bars';
          break;
        }
        case 'stacked bar' : {
          isStacked = true;
          chartType = "Bar";
          seriesType = 'bars';
          break;
        }
        case 'stacked bar 100' : {
          isStacked = "percent";
          chartType = "Bar";
          seriesType = 'bars';
          break;
        }
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
      
      tmp.options['isStacked'] = isStacked;

      tmp.options['title'] = graphTitle;


      tmp.options['vAxis'] = {
        format: '####'
      };

      tmp.options['hAxis'] = {
        format: '####'
      };

      if( graphName == "ComboChart" ){
        //tmp['options']['colors'] = ["#18218f", "#db3a00"];
      };

      if( graphName == "BarChart" ){

        if( current.graphIndicator || current.secondaryGraphIndicator){
          tmp['options']['hAxes'] = {};
          if( current.graphIndicator ){
            tmp['options']['hAxes'][0] = {
              title: current.graphIndicator
            };
          }
          if( current.secondaryGraphIndicator ){
            tmp['options']['hAxes'][1] = {
              title: current.secondaryGraphIndicator
            };
          }
        }
      }else{
        if( current.graphIndicator || current.secondaryGraphIndicator){
          tmp['options']['vAxes'] = {};
          if( current.graphIndicator ){
            tmp['options']['vAxes'][0] = {
              title: current.graphIndicator
            };
          }
          if( current.secondaryGraphIndicator ){
            tmp['options']['vAxes'][1] = {
              title: current.secondaryGraphIndicator
            };
          }
        }
      }

      if( current.graphType == "doughnut" ){
        tmp.options['pieHole'] = 0.4;
      }

      if( chartType && secondaryGraphType ){

        let newType = seriesType  || chartType;

        if( newType == "Bar" ){
          newType = "bars";
        }else if( newType == "column" ){
          newType = "bars";
        }

        if( secondaryGraphType == "bar" ){
          secondaryGraphType = "bars";
        }

        if( secondaryGraphType == "column" ){
          secondaryGraphType = "columns";
        }
        
        tmp.options['seriesType'] = newType;

        tmp.options['series'] = {
          0: {
            targetAxisIndex: 0
          }
        }

        let secondaryIndex = value[0].length-2;

        tmp.options['series'][secondaryIndex] = {
          type: secondaryGraphType,
          targetAxisIndex: secondaryIndex
        };

        console.log( JSON.stringify( value ) );
    
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
      item.graph_group_by = item.filterValues.graph_options.graph_group_by;
      item.graph_v_axis = item.filterValues.graph_options.graph_v_axis;
      item.secondaryGraphType = item.filterValues.graph_options.secondary_graph_type;

      if( item.filterValues.graph_options.secondary_graph_indicator ){
        let secondaryGraphIndicator =  item.filterValues.graph_options.secondary_graph_indicator;
        item.secondaryGraphIndicator = secondaryGraphIndicator[ Object.keys(secondaryGraphIndicator)[0] ];
      }

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

        item.filters.unshift({
          key: 'näitaja',
          options: options
        });

        let indicatorItem = item.filters.filter( item => {
          if( item.key == 'näitaja' ){
            return item;
          }
        })[0];

        this.filters[ item.id ]['näitaja'] = indicatorItem.options[0];

      }catch(err){
        console.error("Couldn't parse indicators!");
      }

      try{
        let groupBy = {
          key: 'groupBy',
          options: []
        };
        for( let i in item.graph_group_by ){
          groupBy.options.push(item.graph_group_by[i]);
        }

        this.filters[ item.id ]['groupBy'] = groupBy.options[0];
        item.filters.unshift(groupBy);

      }catch(err){}

      this.getGraphData( item.id );

      return item;

    });

  }

  getGraphData( id ) {

    clearTimeout( this.requestDebounce[id] );

    this.requestDebounce[id] = setTimeout( () => {

      if( this.requestSubscription[id] ){
        this.requestSubscription[id].unsubscribe();
      }
      
      let current = this.data.filter( (item) => {
        if( id == item.id ){
          return item;
        }
      })[0];
  
      let filters = this.filters[current.id];
  
      if( !this.filtersData[current.id] ){ this.filtersData[current.id] = {}; }

      this.filtersData[current.id].loading = true;

      let professionList = current.filters.filter( x => x.key == 'ametiala' ).map( y => y.options)[0];
      let subFieldList = current.filters.filter( x => x.key == 'alavaldkond' ).map( y => y.options)[0];

      if( professionList.length == 0 ){
        professionList = '';
      }

      if( subFieldList.length == 0 ){
        subFieldList = '';
      }
      let variables = {
        graphType: current['graphType'],
        secondaryGraphType: current.secondaryGraphType,
        secondaryGraphIndicator: current.secondaryGraphIndicator,
        indicator: filters['näitaja'].length > 0 ? filters['näitaja'] : false,
        oskaField: filters.valdkond || '',
        oskaSubField: filters.alavaldkond && filters.alavaldkond.length > 0  ? filters.alavaldkond : subFieldList,
        oskaMainProfession: filters.ametiala && filters.ametiala.length > 0 ? filters.ametiala : professionList,
        period: filters.periood || '',
        label: filters.silt || '',
        graphGroupBy: filters['groupBy'] || '',
        graphVAxis: current['graph_v_axis']
      }


      if( !variables.indicator ){
        try{
          let tmpIndicators = [];
          for( let i in current.filterValues.graph_options.graph_indicator ){
            tmpIndicators.push(i);
          }
          variables.indicator = tmpIndicators;
        }catch(err){

        }
      }


      let tmpVariables = {};
  
      for( let i in variables ){
        if( variables[i] !== ''){
          tmpVariables[i] = variables[i];
        }
      }
  
      this.requestSubscription[id] = this.http.get('googleChartData', { params: tmpVariables} ).subscribe( (response) => {

        let data = response['data'].GoogleChartQuery.map( (item) => {

          let type = variables['graphType'];

          return {
            graphType: type,
            /*graphIndicator: 'Mis ma siia panen? :O',*/
            graphTitle: current.graphTitle,
            value: item.ChartValue,
            secondaryGraphType:	variables['secondaryGraphType'],
            secondaryGraphIndicator:	null
          }
        });
  
        this.filtersData[current.id] = this.compileData( data );

        this.filtersData[current.id].loading = false;

        this.requestSubscription[id].unsubscribe();
        this.requestSubscription[id] = false;

      }, (err) =>{
        this.filtersData[current.id].loading = false;
      });
    }, 300);
    
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
