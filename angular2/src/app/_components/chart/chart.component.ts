import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "chart",
  templateUrl: "chart.template.html",
  styleUrls: ["chart.styles.scss"]
})

export class ChartComponent implements OnInit{
  @Input() data;

  chartData:any = [];
  
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

  capitalize = function(input) {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  compileData() {
    var output = [];
    for( let i in this.data ){
      let current = this.data[i];
      let value = JSON.parse( current.value );
      let graphVAxis = current.graphVAxis;
      let chartType = this.capitalize(current.graphType);
      let graphIndicator = current.graphIndicator;
      let secondaryGraphType = current.secondaryGraphType;

      if( chartType == "Doughnut" ){
        chartType = "Pie";
      }

      let graphName = chartType+"Chart";
      
      if( chartType && secondaryGraphType ){
        graphName = "ComboChart"
      }


      let tmp = {
        "chartType": graphName,
        dataTable: value,
        options: {
          "title": graphIndicator,
          "height": 400,
          "colors": ['#b02d0c', '#d5401a', '#e2770d', '#f8b243', '#0b148c', '#4290bf', '#1b8c9f', '#15adc2', '#700280', '#aa85be', '#af4c96', '#f290aa']
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

        tmp.options['seriesType'] = newType;
        tmp.options['series'] = {
          2: {
            type: secondaryGraphType
          }
        }
      }

      output.push(tmp);
    }

    console.log(output);
    this.chartData = output;


  }

  ngOnInit() {
    this.compileData();
  }
}