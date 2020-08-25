import React, { Component } from 'react';
import { Text, View } from 'react-native';

// import { Logger, LoggingType } from '../../utilities/logging';

export class BarChart extends Component {
    render() {
        console.log("New render");
        // Declare necessary values
        var axis_increment_value, max_y_axis_label;
        var x_axis_labels = [], y_axis_labels = [];
        var max_value = Math.max(...this.props.data.y);
        var min_value_magnitude = Math.abs(Math.min(...this.props.data.y));

        // Determine biggest displacement from 0
        var bigger_displacement_from_null = max_value > min_value_magnitude ? max_value : min_value_magnitude;

        // Determine how much to step axes by
        axis_increment_value = bigger_displacement_from_null < 5 ? 1 : Math.floor(bigger_displacement_from_null / 5);

        // Determine what the maximum value of the y-axis is
        max_y_axis_label = max_value;
        if (max_value % axis_increment_value !== 0) {
            max_y_axis_label = max_value + (axis_increment_value - (max_value % axis_increment_value));
        }
        // Determine what the magnitude of the minimum value of the y-axis is
        var min_y_axis_label = 0;
        if (Math.min(...this.props.data.y) < 0) {
          min_y_axis_label = -min_value_magnitude;
          if (min_value_magnitude % axis_increment_value !== 0) {
            min_y_axis_label = -min_value_magnitude - (axis_increment_value - (min_value_magnitude % axis_increment_value));
          }
        }

        // Add all y-labels
        for (var i = max_y_axis_label; i >= min_y_axis_label; i -= axis_increment_value) {
            y_axis_labels.push(<AxisLabel value={i} key={i} last={i == min_y_axis_label}/>);
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
                                   min_value={min_y_axis_label}
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
        var container_styling = [{flex: 1}];
        var marker = <View style={{width: '25%', height: '100%', alignSelf: 'flex-end', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'grey'}}/>;
        var label  = <Text style={{position: 'absolute', top: -8, right: 8, textAlign: 'right'}}>{this.props.value}</Text>;
        if (this.props.last) {
            container_styling.push({position: 'absolute', bottom: 0, right: 0});
        }
        return(
            <View style={container_styling}>
                {marker}
                {label}
            </View>
        )
        // <Text style={{alignSelf: 'center', transform: [{translateY: -7}]}}>{this.props.value}</Text>
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
                    <View style={{height: 1, width: '25%', borderTopWidth: 1, borderTopColor: 'grey', alignSelf: 'flex-end'}}/>
                </View>
            </View>
        );
    }
}

class GraphBody extends Component {
    render() {
        // Put together bars
        var bars = [];
        for (var i = 0; i < this.props.data.x.length; i++) {
            bars.push(<Bar key={i}
                           value={this.props.data.y[i]} 
                           segment_value={this.props.segment_value}
                           max_value={this.props.max_value} 
                           min_value={this.props.min_value}
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
        var bar_segments = [], positive_value = this.props.value > 0;
        if (positive_value) {
            for (i = this.props.max_value; i >= this.props.segment_value; i -= this.props.segment_value) {
                var number_filled = this.props.segment_value, number_empty = 0, segment_colour_by;
                if (this.props.value < i) {
                    segment_colour_by = this.props.colour_by.slice(i - this.props.segment_value, this.props.value);
                    number_empty = i - this.props.value > this.props.segment_value ? this.props.segment_value : i - this.props.value;
                    number_filled -= number_empty;
                } else {
                    segment_colour_by = this.props.colour_by.slice(i - this.props.segment_value, i);
                }
                var end           = (number_empty > 0 && number_filled > 0) || (i == this.props.max_value && number_empty == 0) || (i === this.props.value);
                var final_segment = i === this.props.max_value;
                bar_segments.push(<BarSegment key={i}
                                              filled={number_filled}
                                              empty={number_empty}
                                              central_axis={i == this.props.segment_value}
                                              final_segment={final_segment}
                                              end={end}
                                              top_half={true}
                                              positive_value={positive_value}
                                              colour_by={segment_colour_by}
                                              colour_scheme={this.props.colour_scheme}/>);
            }
            for (var i = this.props.min_value; i < 0; i += this.props.segment_value) {
                bar_segments.push(<BarSegment key={i}
                                              filled={0}
                                              empty={this.props.segment_value}
                                              central_axis={i == this.props.min_value}
                                              end={false}
                                              top_half={false}
                                              positive_value={positive_value}/>);
            }
        } else {
            for (i = this.props.max_value; i > 0; i -= this.props.segment_value) {
                bar_segments.push(<BarSegment key={i}
                                              filled={0}
                                              empty={this.props.segment_value}
                                              central_axis={i == this.props.segment_value}
                                              end={false}
                                              top_half={true}
                                              positive_value={positive_value}/>);
            }
            for (i = -this.props.segment_value; i >= this.props.min_value; i -= this.props.segment_value) {
                number_filled = this.props.segment_value, number_empty = 0, segment_colour_by;
                if (this.props.value > i) {
                    segment_colour_by = this.props.colour_by.slice(Math.abs(i + this.props.segment_value), Math.abs(this.props.value));
                    number_empty = this.props.value - i > this.props.segment_value ? this.props.segment_value : this.props.value - i;
                    number_filled -= number_empty;
                } else {
                    segment_colour_by = this.props.colour_by.slice(Math.abs(i + this.props.segment_value), Math.abs(i));
                }
                end = (number_empty > 0 && number_filled > 0) || (i == this.props.min_value && number_empty == 0) || (i == this.props.value);
                final_segment = i === this.props.min_value;
                bar_segments.push(<BarSegment key={i}
                                              filled={number_filled}
                                              empty={number_empty}
                                              central_axis={i == -this.props.segment_value}
                                              final_segment={final_segment}
                                              end={end}
                                              top_half={false}
                                              positive_value={positive_value}
                                              colour_by={segment_colour_by}
                                              colour_scheme={this.props.colour_scheme}/>);
            }
        }
        return (
            <View style={{flex: 1, flexDirection: 'column', borderTopWidth: 1, borderRightWidth: 1, borderColor: 'grey'}}>
                {bar_segments}
            </View>
        )
    }
}

class BarSegment extends Component {
    render() {
        var bar_segment_sections = [];
        if (this.props.positive_value) {
          for (var i = this.props.filled + this.props.empty; i > 0; i--) {
            var colour_styling = i <= this.props.filled ? {backgroundColor: this.props.colour_scheme[this.props.colour_by[i - 1]]} : {backgroundColor: ''};
            var border_styling = {borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0)'};
            // Manage end of bars
            if (this.props.end && i === this.props.filled) {
              border_styling.borderTopColor = 'grey';
            }
            // Manage zero axis
            if (this.props.central_axis) {
              if (this.props.top_half) {
                if (i == 1) {
                  border_styling.borderBottomColor = 'grey';
                }
              } else {
                if (i === this.props.filled + this.props.empty) {
                  border_styling.borderTopColor = 'grey';
                }
              }
            }
            // Manage all markers
            if (this.props.empty !== 0 && i === this.props.filled + this.props.empty && !this.props.final_segment) {
              border_styling.borderTopColor = 'grey';
            }
            bar_segment_sections.push(
                <View key={i} style={[{flex: 1}, border_styling, colour_styling]}/>
            );
          }
        } else {
          for (i = 1; i <= this.props.filled + this.props.empty; i++) {
            colour_styling = i <= this.props.filled? {backgroundColor: this.props.colour_scheme[this.props.colour_by[i - 1]]} : {backgroundColor: ''};
            border_styling = {borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0)'};
            // Manage end of bars
            if (this.props.end && i === this.props.filled) {
              border_styling.borderBottomColor = 'grey';
            }
            // Manage zero axis
            if (this.props.central_axis) {
              if (this.props.top_half) {
                if (i == this.props.filled + this.props.empty) {
                  border_styling.borderBottomColor = 'grey';
                }
              } else {
                if (i === 1) {
                  border_styling.borderTopColor = 'grey';
                }
              }
            }
            // Manage all markers
            if (this.props.empty !== 0 && i ===  this.props.filled + this.props.empty && !this.props.final_segment) {
              border_styling.borderBottomColor = 'grey';
            }
            // Remember to put in detection for last segment using background color
            bar_segment_sections.push(
              <View key={i} style={[{flex: 1}, border_styling, colour_styling]}/>
            );
          }
        }
        var container_styling = {flex: 1, flexDirection: 'column'};
        return (
            <View style={container_styling}>
                {bar_segment_sections}
            </View>
        )
    }
}