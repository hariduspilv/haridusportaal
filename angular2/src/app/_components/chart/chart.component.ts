import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "chart",
  templateUrl: "chart.template.html",
  styleUrls: ["chart.styles.scss"]
})

export class ChartComponent implements OnInit{
  @Input() data;

  chartData:any;
  
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
      

      let tmp = {
        "chartType": chartType+"Chart",
        dataTable: value,
        options: {
          "title": graphIndicator
        }
      }

      output.push(tmp);
    }

    this.chartData = output;


  }

  ngOnInit() {
    this.compileData();
  }
}