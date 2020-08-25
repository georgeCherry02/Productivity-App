import React, { Component } from 'react';
import { Text, View } from 'react-native';

import { COLOUR_SCHEME } from '../common/global_styling';

export class Graph extends Component {
   render() {
        return(
            <View style={{flex: 1}}>
                <BarChart data={this.props.data}/>
            </View>
        )
    }
}

class BarChart extends Component {
    render() {
        var axis_increment_value, axis_labels_amount, max_y_axis_label;
        var middle_index;
        var bars = [], x_axis_labels = [], y_axis_labels = [];
        var max_value = Math.max(...this.props.data.y);
        // Determine how much to increment axis by 
        // if less than 5, increment by 1
        // otherwise in multiples of max_value/5
        axis_increment_value = max_value < 5 ? 1 : Math.floor(max_value / 5);
        axis_labels_amount = Math.ceil(max_value /  axis_increment_value);      
        max_y_axis_label = max_value;
        if (max_value % axis_increment_value != 0) {
            max_y_axis_label = max_value + (axis_increment_value - (max_value % axis_increment_value));
        }
        for (var i = max_y_axis_label; i >= axis_increment_value; i -= axis_increment_value) {
            y_axis_labels.push(<AxisLabel value={i} key={i}/>);
        }

        middle_index = this.props.data.x.length % 2 == 0 ? Math.floor(this.props.data.x.length / 2) : -1;
        for (var i = 0; i < this.props.data.y.length; i++) {
            bars.push(<Bar middle={i == middle_index} test={i == 4} max={max_value} value={this.props.data.y[i]} key={i} axis_increment_value={axis_increment_value} axis_labels_amount={axis_labels_amount}/>);
        }
        for (var i = 0; i < this.props.data.x.length; i++) {
            x_axis_labels.push(<HistogramAxisLabel value={this.props.data.x[i]} key={i}/>);
        }
        return (
            <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{width: 30, marginTop: 30, marginBottom: 29, borderRightColor: 'black', borderRightWidth: 1}}>
                    {y_axis_labels}
                </View>
                <View style={{flex: 1, flexDirection: 'column'}}>
                    <View style={{flex: 1, padding: 30, paddingBottom: 0, paddingLeft: 0, flexDirection: 'row'}}>
                        {bars}
                    </View>
                    <View style={{height: 30, marginRight: 30, flexDirection: 'row', justifyContent: 'center', borderTopColor: 'black', borderTopWidth: 1}}>
                        {x_axis_labels}
                    </View>
                </View>
            </View>
        )

    }
}

class Bar extends Component {
    render() {
        var bar_parts = [];
        for (var i = this.props.axis_labels_amount - 1; i >= 0; i--) {
            var proportion_empty = 1, proportion_filled = 0;
            var bar_component_value = this.props.value - (i * this.props.axis_increment_value);
            if (bar_component_value > 0 && bar_component_value < this.props.axis_increment_value) {
                proportion_filled = bar_component_value;
                proportion_empty = this.props.axis_increment_value - bar_component_value;
            } else if (bar_component_value >= this.props.axis_increment_value) {
                proportion_filled = 1;
                proportion_empty  = 0;
            }
            var border_top_width = 0;
            if (proportion_empty != 0 || i == this.props.axis_labels_amount - 1) {
                border_top_width = 1;
            }
            var border_bottom_width = 1;
            var border_bottom_colour = 'grey';
            if (proportion_filled > 0) {
                border_bottom_colour = 'red';
                border_bottom_width = 2;
            }
            bar_parts.push( <View key={i} style={{flex: 1, flexDirection: 'column'}}>
                                <View style={{flex: 1, borderTopWidth: border_top_width, borderRightWidth: 1, borderBottomWidth: border_bottom_width, borderColor: 'grey', borderBottomColor: border_bottom_colour}}>
                                    <View style={{flex: proportion_empty}}></View>
                                    <View style={{flex: proportion_filled, backgroundColor: 'red'}}></View>
                                </View>
                            </View>);
        }
        return(
            <View style={{flex: 1, flexDirection: 'column'}}>
                {bar_parts}
            </View>
        )
    }
}

class HistogramAxisLabel extends Component {
    render() {
        return(
            <View style={{flex: 1, justifyContent: 'center'}}>
                <Text style={{alignSelf: 'center', fontSize: 4}}>{this.props.value}</Text>
            </View>
        )
    }
}

class AxisLabel extends Component {
    render() {
        return(
            <View style={{flex: 1}}>
                <Text style={{alignSelf: 'center'}}>{this.props.value}</Text>
            </View>
        )
    }
}