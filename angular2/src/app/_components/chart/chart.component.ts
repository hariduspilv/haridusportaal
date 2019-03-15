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

  initiallyFilledSelects = ['näitaja', 'valdkond', 'näitaja2'];

  graphOptions = {
    height: 500,
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
    legend: { position: 'bottom', maxLines: 3, alignment: 'start' },
    colors: ['#18218F', '#DB3A00', '#0252B0', '#9E02B6', '#257E25', '#D11B1B', '#C200C2', '#00856A', '#0071C7', '#D11B6F', '#D704A2', '#198294'],
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
          isStacked = true;
          chartType = "Bar";
          seriesType = 'bars';
          break;
        }
        case 'stacked column': {
          isStacked = true;
          chartType = "Column";
          seriesType = 'bars';
        }
      }

      let primaryFormat = '####';

      console.log(current);
      if( current.options.graph_y_unit ){
        switch( current.options.graph_y_unit ){
          case 'summa': {
            primaryFormat = '####';
            break;
          }
          case '%': {
            primaryFormat = 'percent';
            break;
          }
          case 'euro': {
            primaryFormat = '#€';
            break;
          }
          default: {
            primaryFormat = '####';
          }
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
        format: primaryFormat
      };

      tmp.options['hAxis'] = {
        format: '####'
      };

      //tmp.options['hAxis']['ticks'] = ticks;


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

      this.filters[ item.id ] = {};

      let multipleIndicators = true;

      try{

        if( item.filterValues.graph_options.secondary_graph_indicator ){
          let secondaryGraphIndicator = item.filterValues.graph_options.secondary_graph_indicator;
          item.secondaryGraphIndicator = secondaryGraphIndicator[ Object.keys(secondaryGraphIndicator)[0] ];
        }

        let tmpFilters = [];
        
        for( let i in item.filterValues.graph_options.graph_filters ){
          let current = item.filterValues.graph_options.graph_filters[i];

          let options = [];

          for( let o in current ){
            options.push(current[o]);
          };

          if( (i == 'valdkond' || i == 'ametiala' || i == 'alavaldkond') && options.length > 1 ){
            multipleIndicators = false;
          }

          tmpFilters.push(
            {
              key: i,
              multiple: true,
              options: options
            }
          );
          
        }

        try{
          let indicator = item.filterValues.graph_options.secondary_graph_indicator;
          let tmp = [];
          for( let i in indicator ){
            tmp.push(indicator[i]);
          }

          if( tmp.length > 0 ){
            tmpFilters.push({
              key: 'näitaja2',
              multiple: multipleIndicators,
              options: tmp
            });
            this.filters[ item.id ]['näitaja2'] = tmp[0];
          }
          
        }catch(err){}

        item.filters = tmpFilters;

      }catch(err){
        console.error("Couldn't parse filters!");
      }
      
      let hasGroups = false;

      try{

        let groupBy = {
          key: 'groupBy',
          multiple: false,
          options: []
        };

        for( let i in item.graph_group_by ){
          groupBy.options.push(item.graph_group_by[i]);
        }

        this.filters[ item.id ]['groupBy'] = groupBy.options[0];
        
        item.filters.unshift(groupBy);

        hasGroups = true;

      }catch(err){}

      try{
        let options = [];

        for( let i in item.filterValues.graph_options.graph_indicator ){
          options.push(item.filterValues.graph_options.graph_indicator[i]);
        }

        let splicePos = 0;

        if( hasGroups ){
          splicePos = 1;
        }
        
        item.filters.splice( splicePos, 0, {
          key: 'näitaja',
          multiple: multipleIndicators,
          options: options
        });

      }catch(err){
        console.error("Couldn't parse indicators!");
      }

      this.setInitialValues( item.id );

      this.getGraphData( item.id );

      return item;

    });

  }

  setInitialValues(id) {

    let item = this.data.filter( entry => {
      if( entry.id == id ){ return entry; }
    })[0];

    for( let i in item.filters ){
      let current = item.filters[i];
      let options = current.options;

      if( options.length > 0 ){
        if( this.initiallyFilledSelects.indexOf( current.key ) !== -1 ){
          this.filters[item.id][current.key] = current.multiple ? [options[0]] : options[0];
        }
      }
    }

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
      let fieldList = current.filters.filter( x => x.key == 'valdkond' ).map( y => y.options)[0];
      let secondaryIndicatorList = current.filters.filter( x => x.key == 'näitaja2' ).map( y => y.options)[0];

      if( !secondaryIndicatorList || secondaryIndicatorList.length == 0 ){
        secondaryIndicatorList = '';
      }

      if( !professionList || professionList.length == 0 ){
        professionList = '';
      }

      if( !subFieldList || subFieldList.length == 0 ){
        subFieldList = '';
      }

      if( !fieldList || fieldList.length == 0 ){
        fieldList = '';
      }

      let variables = {
        graphType: current['graphType'],
        secondaryGraphType: current.secondaryGraphType,
        secondaryGraphIndicator:  filters['näitaja2'] && filters['näitaja2'].length > 0  ? filters['näitaja2'] : secondaryIndicatorList,
        indicator: filters['näitaja'].length > 0 ? filters['näitaja'] : false,
        oskaField: filters.valdkond && filters.valdkond.length > 0  ? filters.valdkond : fieldList,
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
            secondaryGraphIndicator:	null,
            options: current['filterValues']['graph_options']
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
