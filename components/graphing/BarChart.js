import React, { Component } from 'react';
import { Text, View } from 'react-native';

// import { Logger, LoggingType } from '../../utilities/logging';

/*
 * There are significant issues with using specific side border properties and often leads to weird gaps in rendering
 * I.e. the flex properties start breaking and continuous shapes don't really happen
 * Hence throughout this I've used <View/> elements inside the inital element as single side borders
 */
export class BarChart extends Component {
    render() {
        var axis_increment_value, axis_labels_amount, max_y_axis_label;
        var x_axis_labels = [], y_axis_labels = [];
        var max_value = Math.max(...this.props.data.y);
        axis_increment_value = max_value < 5 ? 1 : Math.floor(max_value / 5);
        axis_labels_amount = Math.ceil(max_value / axis_increment_value);
        max_y_axis_label = max_value;
        if (max_value % axis_increment_value !== 0) {
            max_y_axis_label = max_value + (axis_increment_value - (max_value % axis_increment_value));
        }

        // Add all y-labels
        for (var i = max_y_axis_label; i >= axis_increment_value; i -= axis_increment_value) {
            y_axis_labels.push(<AxisLabel value={i} key={i}/>);
        }
        // Add all x-labels
        for (i = 0; i < this.props.data.x.length; i++) {
            x_axis_labels.push(<HistogramAxisLabel value={this.props.data.x[i]} key={i}/>);
        }


        return (
            <View style={{flex: 1}}>
                <View style={{flex: 1, margin: 20, flexDirection: 'row'}}>
                    <AxisLabelContainerY>{y_axis_labels}</AxisLabelContainerY>
                    <View style={{flex: 1, flexDirection: 'column'}}>
                        <GraphBody data={this.props.data}
                                   segment_value={axis_increment_value}
                                   max_value={max_y_axis_label}
                                   colour_by={this.props.colour_by}
                                   colour_scheme={this.props.colour_scheme}/>
                        <AxisLabelContainerX>{x_axis_labels}</AxisLabelContainerX>
                    </View>
                </View>
            </View>
        );
    }
}

/**
 * ***************************************************************************************************
 * Check out the translateY property and revisit later with more time as a constant -7 is questionable
 * ***************************************************************************************************
 */
class AxisLabel extends Component {
    render() {
        return(
            <View style={{flex: 1}}>
                <View style={{width: '25%', height: 1, position: 'absolute', backgroundColor: 'grey', alignSelf: 'flex-end'}}/>
                <Text style={{alignSelf: 'center', transform: [{translateY: -7}]}}>{this.props.value}</Text>
            </View>
        )
    }
}
class HistogramAxisLabel extends Component {
    render() {
        // AGGHHHHHH Check this at some point
        return(
            <View style={{flex: 1, justifyContent: 'center'}}>
                <Text adjustsFontSizeToFit style={{alignSelf: 'center', margin: 2}} numberOfLines={1}>{this.props.value}</Text>
            </View>
        )
    }
}

class AxisLabelContainerX extends Component {
    render() {
        return (
            <View style={{height: '7%', width: '100%'}}>
                <View style={{position: 'absolute', height: 1, width: '100%', backgroundColor: 'grey'}}/>
                <View style={{flex: 1, flexDirection: 'row'}}>{this.props.children}</View>
            </View>
        );
    }
}
class AxisLabelContainerY extends Component {
    render() {
        return (
            <View style={{height: '100%', width: '7%'}}>
                <View style={{position: 'absolute', height: '93.2%', width: 1, backgroundColor: 'grey', alignSelf: 'flex-end'}}></View>
                <View style={{flexDirection: 'column', height: '93.2%', width: '100%'}}>
                    {this.props.children}
                </View>
            </View>
        );
    }
}

class GraphBody extends Component {
    render() {
        var data = this.props.data
        var bars = [];
        for (var i = 0; i < data.x.length; i++) {
            bars.push(<Bar key={i}
                           value={data.y[i]} 
                           segment_value={this.props.segment_value}
                           max_value={this.props.max_value} 
                           colour_by={this.props.colour_by[i]}
                           colour_scheme={this.props.colour_scheme}/>);
        }
        return (
            <View style={{flex: 1, flexDirection: 'row'}}>
                {bars}
            </View>
        );
    }
}

class Bar extends Component {
    render() {
        var bar_segments = [];
        for (var i = this.props.max_value; i >= this.props.segment_value; i -= this.props.segment_value) {
            var number_filled = this.props.segment_value, number_empty = 0, segment_colour_by;
            if (this.props.value < i) {
                segment_colour_by = this.props.colour_by.slice(i - this.props.segment_value, this.props.value);
                number_empty = i - this.props.value > this.props.segment_value ? this.props.segment_value : i - this.props.value;
                number_filled -= number_empty;
            } else {
                segment_colour_by = this.props.colour_by.slice(i - this.props.segment_value, i);
            }
            var top_of_bar = (this.props.value == i);
            bar_segments.push(<BarSegment key={i}
                                          filled={number_filled}
                                          empty={number_empty}
                                          top={top_of_bar}
                                          colour_by={segment_colour_by}
                                          colour_scheme={this.props.colour_scheme}/>);   
        }
        return (
            <View style={{flex: 1, flexDirection: 'column', borderRightWidth: 1, borderRightColor: 'grey'}}>
                {bar_segments}
            </View>
        )
    }
}

class BarSegment extends Component {
    render() {
        var bar_segment_sections = [];
        for (var i = this.props.filled + this.props.empty; i > 0; i--) {
            var colour_styling = i <= this.props.filled ? {backgroundColor: this.props.colour_scheme[this.props.colour_by[i - 1]]} : {backgroundColor: ''};
            bar_segment_sections.push(
                <View key={i} style={[{flex: 1}, colour_styling]}/>
            )
        }

        var container_styling = [{flex: 1, flexDirection: 'column'}];
        if (this.props.empty !== 0 || this.props.top) {
            container_styling.push({borderTopWidth: 1, borderTopColor: 'grey'});
        }
        return (
            <View style={container_styling}>
                {bar_segment_sections}
            </View>
        )
    }
}