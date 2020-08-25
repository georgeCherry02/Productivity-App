import React, { Component } from 'react';
import { Text, View } from 'react-native';

/**
 * This one doesn't require individual elements for each box, hence it's more flexible when rendering, probably a much better choice
 * @property.data           An object of the form {"x": [n], "y": [n]} where [n] represents an array of n elements for "x" and "y"
 * @property.colour_by      An array n long containing objects representing the colour coding of each data point.
 *                          An individual object looks like {"key": int proportion, ...} for as many keys as necessary
 * @property.colour_scheme  An object that denotes the colour coding, follows {"key": backgroundColor, ...} for as many keys as above
 */
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
    var bars = [];
    for (var i = 0; i < this.props.data.x.length; i++) {
      bars.push(<Bar key={i}
                     value={this.props.data.y[i]}
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
    var bar_segments = [];
    var bar_internals = [];
    for (var key in this.props.colour_by) {
      console.log(this.props.colour_by[key]);
      bar_internals.push(<View style={{flex: this.props.colour_by[key], backgroundColor: this.props.colour_scheme[key]}}/>)
    }
    if (this.props.value > 0) {
      bar_segments.push(<View style={{flex: this.props.max_value - this.props.value}}/>);
      bar_segments.push(<View style={{flex: this.props.value, backgroundColor: 'green', flexDirection: 'column-reverse'}}>{bar_internals}</View>);
      bar_segments.push(<View style={{flex: Math.abs(this.props.min_value)}}/>)
    } else {
      bar_segments.push(<View style={{flex: this.props.max_value}}/>);
      bar_segments.push(<View style={{flex: Math.abs(this.props.value), backgroundColor: 'green'}}>{bar_internals}</View>);
      bar_segments.push(<View style={{flex: this.props.value - this.props.min_value}}/>);
    }
    return (
      <View style={{flex: 1, flexDirection: 'column', borderWidth: 1, borderColor: 'grey'}}>
        {bar_segments}
      </View>
    )
  }
}