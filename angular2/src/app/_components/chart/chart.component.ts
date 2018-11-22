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
        "chartType": graphName,
        dataTable: value,
        options: {
          "title": graphTitle,
          "height": 400,
          "pieSliceTextStyle": {
            "color": '#ffffff'
          },
          "colors": ['#18218F', '#9E02B6', '#0252B0', '#C200C2', '#0071C7', '#D704A2', '#198294', '#D11B6F', '#00856A', '#D11B1B', '#257E25', '#DB3A00']
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
          1: {
            type: secondaryGraphType
          }
        }

        console.log(tmp);
    
      }

      output.push(tmp);
    }

    this.chartData = output;


  }

  ngOnInit() {
    this.compileData();
  }
}