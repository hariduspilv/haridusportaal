import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import conf from '@app/_core/conf';

@Component({
  selector: 'chart',
  templateUrl: 'chart.template.html',
  styleUrls: ['chart.styles.scss'],
})

export class ChartComponent implements OnInit {
  @Input() data;
  @Input() type = 'default';
  @Input() height = 500;
  @Input() wide = false;

  chartData: Object = [];

  objectKeys = Object.keys;

  filters: Object = {};
  unselectableFilters: Object = {};

  filtersData: Object = {};

  requestDebounce: Object = {};
  requestSubscription: Object = {};

  initiallyFilledSelects = ['näitaja', 'valdkond'];

  singleIndicatorCharts = ['line', 'pie', 'doughnut'];

  wideChartTypesToFormat: Object[] = ['bar', 'column'];

  mainLineColors: string[] = ['#4146AF', '#980000', '#E87502', '#1398AA', '#4F00FA'];

  constructor(private http: HttpClient) {}

  getGraphOptions() {

    return {
      titlePosition: 'none',
      height: this.height,
      chartArea: {
        top: 24,
        bottom: 75,
      },
      pieSliceTextStyle: {
        color: '#333',
      },
      pieSliceBorderColor: '#333',
      curveType: 'function',
      lineWidth: 3,
      pointsVisible: true,
      pointSize: 10,
      legend: { position: 'bottom', maxLines: 99, alignment: 'start' },
      tooltip: {},
      colors: ['#fd8208', '#f8b243', '#ffc388', '#ffe7c1', '#bee3e8', '#6ccfdc', '#16b5ca'],

      animation: {
        duration: 1000,
        easing: 'out',
        startup: true,
      },
    };
  }

  capitalize(input) {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  getFormat(unit) {
    let format;
    switch (unit) {
      case '%': {
        format = 'percent';
        break;
      }
      case 'euro': {
        format = '#,### €';
        break;
      }
      default: {

      }
    }
    return format;
  }

  dividePercentage(value) {
    try {
      const val = value.map((item) => {
        return item.map((col) => {
          if (!isNaN(col) && typeof col === 'number') {
            return col / 100;
          }
          return col;
        });
      });
      return val;
    } catch (err) {
      return value;
    }
  }

  formatRangeValue(primaryFormat, value) {

    if (!value) {
      return 0;
    }
    let tmp;
    if (primaryFormat === '#€') {
      tmp = `${parseInt(value, 10)} €`;
    } else if (primaryFormat === 'percent') {
      tmp = (parseInt(value, 10)) / 100;
    } else {
      tmp = parseInt(value, 10);
    }

    return tmp;
  }

  getGraphHeight(value, type) {
    if (!value || !value[0] || !value[1]) {
      return this.height;
    }  if (type !== 'stacked bar 100' && type !== 'clustered bar' && type !== 'stacked bar') {
      return this.height;
    }

    const rows = value.length - 1;
    const cols = value[1].length - 1;
    let height;

    // if (type == 'clustered bar') {
    //   height = rows * cols * 10;
    // } else
    if (type === 'stacked bar 100' || type === 'stacked bar' || type === 'clustered bar') {
      height = rows * 64;
    } else {
      height = rows * 28;
    }

    // if (type == 'clustered bar') {
    //   height += (rows - 1) * 40;
    // }

    // height = height / 0.75;
    height += 150; // graph legend & title space

    if (height < 400) {
      height = 400;
    }

    return height;

  }

  compileData(inputData: any = false) {

    const output = [];

    const data = inputData || this.data;

    for (const i in data) {
      const current = data[i];
      const value = JSON.parse(current.value);
      const graphVAxis = current.graphVAxis;
      let chartType = this.capitalize(current.graphType);
      const graphIndicator = current.graphIndicator;
      const graphTitle = this.capitalize(current.graphTitle);
      let secondaryGraphType = current.secondaryGraphType;
      let isStacked: any = false;
      let seriesType: any = false;
      let primaryFormat;
      const titleCaseValues = value ? value.map((single, index) => {
        single.map((field) => {
          return (typeof field === 'string' && field.length)
            ? this.capitalize(field) : field;
        });
        if (chartType.toLowerCase() !== 'line') {
          const parsedArray = [];
          single.forEach((item, ind) => {
            parsedArray.push(item);
            if (index) {
              if ((secondaryGraphType && ind === 1) || (!secondaryGraphType && ind)) {
                parsedArray.push('stroke-color: #333; stroke-width: 1px');
              }
            } else if (secondaryGraphType && ind === 1 || !secondaryGraphType && ind) {
              parsedArray.push({ role: 'style' });
            }
          });
          return parsedArray;
        }
        return single;
      }) : value;

      if (chartType === 'Doughnut') {
        chartType = 'Pie';
      }

      if (current.options.graph_y_unit) {
        primaryFormat = this.getFormat(current.options.graph_y_unit);
      }

      switch (chartType.toLowerCase()) {
        case 'clustered bar': {
          isStacked = false;
          chartType = 'Bar';
          seriesType = 'bars';
          break;
        }
        case 'clustered column': {
          isStacked = false;
          chartType = 'Column';
          seriesType = 'bars';
          break;
        }
        case 'stacked bar': {
          isStacked = true;
          chartType = 'Bar';
          seriesType = 'bars';
          break;
        }
        case 'stacked bar 100': {
          isStacked = 'percent';
          chartType = 'Bar';
          seriesType = 'bars';
          primaryFormat = 'percent';
          break;
        }
        case 'stacked column 100': {
          isStacked = 'percent';
          chartType = 'Column';
          seriesType = 'columns';
          primaryFormat = 'percent';
          break;
        }
        case 'stacked column': {
          isStacked = true;
          chartType = 'Column';
          seriesType = 'bars';
        }
      }

      if (primaryFormat === 'percent') {
        // value = this.dividePercentage( value );
      }

      let graphName = `${chartType}Chart`;

      if (chartType && secondaryGraphType) {
        graphName = 'ComboChart';
      }

      const tmp = {
        chartType: graphName,
        dataTable: titleCaseValues,
        options: this.getGraphOptions(),
      };

      tmp.options.height = this.getGraphHeight(titleCaseValues, current.graphType);

      tmp.options['isStacked'] = isStacked;

      tmp.options['title'] = graphTitle;

      tmp.options['vAxis'] = {
        format: primaryFormat,
      };

      if (current.options.graph_y_min) {
        tmp.options['vAxis']['minValue']
          = this.formatRangeValue(primaryFormat, current.options.graph_y_min);
      }

      if (isStacked === 'percent') {
        tmp.options['vAxis']['minValue'] = 0;
      }

      tmp.options['hAxis'] = {
        format: '####',
      };

      if (chartType === 'Bar' && isStacked === 'percent') {
        tmp.options['hAxis'] = {
          format: primaryFormat,
        };
      }
      // Wide chart check or nah?  // this.wide &&
      if (this.wideChartTypesToFormat.includes(chartType.toLowerCase())
        && !current.secondaryGraphType) {
        this.formatWideGraphTypes(tmp.options);
      }

      let filters = false;
      if (current.id) {
        filters = this.filters[current.id];
      }

      if (graphName === 'BarChart') {

        if (current.graphIndicator || current.secondaryGraphIndicator) {
          tmp['options']['hAxes'] = {};
          if (current.graphIndicator) {
            tmp['options']['hAxes'][0] = {
              title: current.graphIndicator,
            };
          }
          if (current.secondaryGraphIndicator) {
            tmp['options']['hAxes'][1] = {
              title: current.secondaryGraphIndicator,
            };
          }
        }
      } else {
        if (current.graphIndicator || current.secondaryGraphIndicator) {
          tmp['options']['vAxes'] = {};
          if (current.graphIndicator) {
            tmp['options']['vAxes'][0] = {
              title: current.graphIndicator,
            };
          }
          if (current.secondaryGraphIndicator) {
            tmp['options']['vAxes'][1] = {
              title: current.secondaryGraphIndicator,
            };
          }
        }
      }

      if (current.graphType === 'doughnut') {
        tmp.options['pieHole'] = 0.4;
      }

      if (current.graphType === 'line') {
        tmp.options['colors'] = this.mainLineColors;
      }

      if (chartType && secondaryGraphType) {

        let newType = seriesType || chartType;

        if (newType === 'Bar') {
          newType = 'bars';
        } else if (newType === 'column') {
          newType = 'bars';
        }

        if (secondaryGraphType === 'bar') {
          secondaryGraphType = 'bars';
        }

        if (secondaryGraphType === 'column') {
          secondaryGraphType = 'columns';
        }

        tmp.options['seriesType'] = newType;

        tmp.options['series'] = {
          0: {
            targetAxisIndex: 0,
          },
        };

        if (filters && filters['näitaja2'] && filters['näitaja2'].length > 0) {
          const lineColors = this.mainLineColors;
          let colorCounter = 0;

          for (const i in filters['näitaja2']) {
            const index = titleCaseValues[0].findIndex(item =>
              typeof item === 'string'
                ? filters['näitaja2'][i].toLowerCase() === item.toLowerCase()
                : null);
            tmp.options.colors[index - 2] = lineColors[colorCounter];
            tmp.options['series'][index - 2] = {
              type: secondaryGraphType,
              targetAxisIndex: 1,
              viewWindow: {
                min: 1000,
              },
            };
            colorCounter += 1;
            if (colorCounter > lineColors.length - 1) { colorCounter = 0; }
          }
        }

      }

      output.push(tmp);

    }

    if (inputData) {
      return output[0];
    }
    this.chartData = output;
  }

  generateID(length = 10) {
    let str = '';
    for (let i = 0; i < length; i += 1) {
      str += (Math.random() * 36).toString(36).substr(2, 1);
    }
    return str;
  }

  parseData() {
    this.data = this.data.map((item) => {
      try {
        item.filterValues = JSON.parse(item.filterValues);
      } catch (err) {
        console.log('Error parsing JSON');
      }
      item.id = this.generateID();

      item.graph_group_by = item.filterValues.graph_options.graph_group_by;
      item.graph_v_axis = item.filterValues.graph_options.graph_v_axis;
      item.secondaryGraphType = item.filterValues.graph_options.secondary_graph_type;

      this.filters[item.id] = {};
      this.unselectableFilters[item.id] = {};

      let multipleIndicators = true;

      try {

        if (item.filterValues.graph_options.secondary_graph_indicator) {
          const secondaryGraphIndicator = item.filterValues.graph_options.secondary_graph_indicator;
          item.secondaryGraphIndicator
            = secondaryGraphIndicator[Object.keys(secondaryGraphIndicator)[0]];
        }

        const tmpFilters = [];
        const pieCases = ['valdkond', 'ametiala', 'alavaldkond', 'silt', 'periood'];
        const wideCases = pieCases.slice(0, 3);

        for (const i in item.filterValues.graph_options.graph_filters) {
          multipleIndicators = true;
          const current = item.filterValues.graph_options.graph_filters[i];

          const options = [];

          for (const o in current) {
            options.push(current[o]);
          }

          // Disable multiple selection for wide views and Pie/Doghnut types on following filters.
          if ((wideCases.includes(i) && options.length > 1 && this.wide)
            || (pieCases.includes(i) && options.length > 1
            && (item.filterValues.graph_type === 'pie'
            || item.filterValues.graph_type === 'doughnut'))) {
            multipleIndicators = false;
          }
          tmpFilters.push(
            {
              options,
              key: i,
              multiple: multipleIndicators,
            },
          );
        }

        try {
          const secondaryIndicators = [];

          const indicator = item.filterValues.graph_options.indicators;
          for (const i in indicator) {
            const indicatorValue
              = Object.keys(indicator[i].indicator_set.secondary_graph_indicator);
            secondaryIndicators[i] = indicatorValue;
          }
          this.unselectableFilters[item.id].näitaja2 = secondaryIndicators;

        } catch (err) { }

        item.filters = tmpFilters;

      } catch (err) {
        console.error("Couldn't parse filters!");
      }

      let hasGroups = false;

      try {

        const groupBy = {
          key: 'grupeeri',
          multiple: false,
          options: [],
        };
        if (item.graph_group_by instanceof Object && Object.values(item.graph_group_by).length) {
          for (const i in item.graph_group_by) {
            groupBy.options.push(item.graph_group_by[i]);
          }
        } else {
          groupBy.options.push(item.graph_group_by);
        }

        this.filters[item.id]['grupeeri'] = groupBy.options[0];

        item.filters.unshift(groupBy);

        hasGroups = true;

      } catch (err) { }

      try {
        const options = [];

        if (this.singleIndicatorCharts.includes(item.graphType)) {
          for (const i in item.filterValues.graph_options.graph_indicator) {
            options.push(item.filterValues.graph_options.graph_indicator[i]);
          }
        } else {
          for (const i in item.filterValues.graph_options.indicators) {
            options[i]
              = item.filterValues.graph_options.indicators[i].indicator_set.graph_indicator;
          }
        }

        let splicePos = 0;

        if (hasGroups) {
          splicePos = 1;
        }

        item.filters.splice(splicePos, 0, {
          options,
          key: 'näitaja',
          multiple: false,
        });
      } catch (err) {
        console.error("Couldn't parse indicators!");
      }

      this.setInitialValues(item.id);

      this.getGraphData(item.id);
      return item;

    });

  }

  setInitialValues(id) {

    const item = this.data.filter((entry) => {
      if (entry.id === id) { return entry; }
    })[0];

    for (const i in item.filters) {
      const current = item.filters[i];
      const options = current.options;

      if (current.multiple) {
        this.filters[item.id][current.key] = options;
      } else if (options.length > 0) {
        if (this.initiallyFilledSelects.indexOf(current.key) !== -1) {
          this.filters[item.id][current.key] = current.multiple ? [options[0]] : options[0];
        }
      }

    }

  }

  getGraphData(id) {

    clearTimeout(this.requestDebounce[id]);

    this.requestDebounce[id] = setTimeout(() => {

      if (this.requestSubscription[id]) {
        this.requestSubscription[id].unsubscribe();
      }

      const current = this.data.filter((item) => {
        if (id === item.id) {
          return item;
        }
      })[0];

      const filters = this.filters[current.id];
      const unselectableFilters = this.unselectableFilters[current.id];

      if (!this.filtersData[current.id]) { this.filtersData[current.id] = {}; }

      this.filtersData[current.id].loading = true;

      let professionList = current.filters.filter(x => x.key === 'ametiala').map(y => y.options)[0];
      let subFieldList
        = current.filters.filter(x => x.key === 'alavaldkond').map(y => y.options)[0];
      let fieldList = current.filters.filter(x => x.key === 'valdkond').map(y => y.options)[0];

      const secondaryIndicatorList = '';
      if (typeof unselectableFilters['näitaja2'] !== 'undefined') {
        current.filters.filter((obj) => {
          if (obj.key === 'näitaja') {
            filters['näitaja2']
              = unselectableFilters['näitaja2'][obj.options.indexOf(filters['näitaja'])];
          }
        });
      }

      if (!professionList || professionList.length === 0) {
        professionList = '';
      }

      if (!subFieldList || subFieldList.length === 0) {
        subFieldList = '';
      }

      if (!fieldList || fieldList.length === 0) {
        fieldList = '';
      }

      const variables = {
        graphType: current['graphType'],
        secondaryGraphType: current.secondaryGraphType,
        secondaryGraphIndicator: filters['näitaja2'] && filters['näitaja2'].length > 0
          ? filters['näitaja2'] : secondaryIndicatorList,
        indicator: filters['näitaja'] && filters['näitaja'].length > 0 ? filters['näitaja'] : false,
        oskaField: filters.valdkond && filters.valdkond.length > 0 ? filters.valdkond : fieldList,
        oskaSubField: filters.alavaldkond && filters.alavaldkond.length > 0
          ? filters.alavaldkond : subFieldList,
        oskaMainProfession: filters.ametiala && filters.ametiala.length > 0
          ? filters.ametiala : professionList,
        period: filters.periood || '',
        label: filters.silt || '',
        graphGroupBy: filters['grupeeri'] || '',
        graphVAxis: current['graph_v_axis'],
      };

      if (!variables.indicator) {
        try {
          const tmpIndicators = [];
          for (const i in current.filterValues.graph_options.graph_indicator) {
            tmpIndicators.push(i);
          }
          variables.indicator = tmpIndicators;
        } catch (err) {

        }
      }

      const tmpVariables = {};

      for (const i in variables) {
        if (variables[i] !== '') {
          tmpVariables[i] = variables[i];
        }
      }
      let url
        = 'graphql?queryName=googleChartData&queryId=9bdca5d7f53e0755482e65d091682f48ee77b635:1';
      url += `&variables=${JSON.stringify(tmpVariables)}`;
      url = encodeURI(url);
      this.requestSubscription[id]
        = this.http.get(`${conf.api_prefix}${url}`).subscribe((response) => {
          const data = response['data'].GoogleChartQuery.map((item) => {

            const type = variables['graphType'];

            return {
              graphType: type,
              /*graphIndicator: 'Mis ma siia panen? :O',*/
              graphTitle: current.graphTitle,
              value: item.ChartValue,
              secondaryGraphType: variables['secondaryGraphType'],
              secondaryGraphIndicator: null,
              options: current['filterValues']['graph_options'],
              id: current['id'],
            };
          });

          this.filtersData[current.id] = this.compileData(data);

          this.filtersData[current.id].loading = false;

          this.requestSubscription[id].unsubscribe();
          this.requestSubscription[id] = false;
        },                                                    (err) => {
          this.filtersData[current.id].loading = false;
        });
    },                                    300);

  }

  formatWideGraphTypes (options) {
    const locations = ['hAxis', 'vAxis', 'legend', 'tooltip'];
    locations.forEach(elem => options[elem]['textStyle'] = { fontSize: 14 });
    options['titleTextStyle'] = { fontSize: 16 };
    options['chartArea'] = {
      width: '66.6%',
      top: 56,
      bottom: 75,
      right: 24,
    };
  }
  ngOnInit() {
    switch (this.type) {
      case 'filter': {
        try {
          this.parseData();
        } catch (err) { }
        break;
      }
      default: {
        try {
          this.compileData();
        } catch (err) { }
      }
    }
  }
}
