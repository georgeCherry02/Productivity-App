import React, { Component, version } from 'react';

import { ScrollView, Text, View, TouchableWithoutFeedback } from 'react-native';
import { Graph } from '../graphing/Graph';

import { Animated, StyleSheet } from 'react-native';
import { COLOUR_SCHEME, COLOUR_SCALE } from '../common/global_styling';


import * as SQLite from 'expo-sqlite';

import { Logger, LoggingType } from '../../utilities/logging';
import { BarChart } from '../graphing/BarChart';

export class ReviewPage extends Component {
    constructor(props) {
        super(props);

        this.db = SQLite.openDatabase("Productivity_Database");

        this.state = {}

        this.fetch_task_data.bind(this);
    }

    componentDidMount() {
        this.fetch_task_data();
    }

    render() {
        if (this.state.task_data !== undefined) {
            const colour_by = 'urgency', order_by = 'difficulty';
            var grouped_by_dif      = this.group_data(order_by);
            var ordered_by_urgency  = this.order_data(grouped_by_dif, colour_by);
            var [g_data, colouring] = this.process_data_to_graph(ordered_by_urgency, order_by, colour_by);
        } else {
            return <View style={{flex: 1}}/>
        }
        return (
            <ScrollView style={{flex: 1}}>
                <ReviewSegment
                    segment_name={"Test"}>
                    <BarChart data={g_data}
                              colour_by={colouring}
                              colour_scheme={COLOUR_SCALE}/>
                </ReviewSegment>
            </ScrollView>
        )
    }

    fetch_task_data() {
        const sql = "SELECT id, difficulty, type_id, urgency, time_predicted, time_spent FROM `Tasks` WHERE Completed LIKE 1;";
        this.db.transaction(
            tx => {
                tx.executeSql(
                    sql,
                    [],
                    (_, { rows }) => {
                        Logger.log(LoggingType.STATUS_BRIEF, "Fetched task data");
                        this.structure_task_data(rows._array);
                    }
                )
            },
            null,
            this.update
        )
    }
    structure_task_data(data) {
        Logger.log(LoggingType.STATUS_BRIEF, "Structuring data");
        var structured_data = {};
        for (var i = 0; i < data.length; i++) {
            structured_data[data[i].id] = data[i];
            delete structured_data[data[i].id]["id"];
        }
        this.setState({
            task_data: structured_data
        });
    }
    group_data(group_by) {
        var grouped_data = {};
        switch (group_by) {
            case "difficulty":
            case "urgency":
                for (var i = 1; i <= 5; i++) {
                    grouped_data[i] = [];
                }
                break;
        }
        var raw_data = this.state.task_data;
        for (var id in raw_data) {
            grouped_data[raw_data[id][group_by]].push(id);
        }
        return grouped_data;
    }
    order_data(data, order_by) {
        Logger.log(LoggingType.STATUS_BRIEF, "Ordering data");
        for (var group in data) {
            this.array_to_sort = data[group];
            this.quick_sort(0, data[group].length - 1, order_by);
            data[group] = this.array_to_sort;
        }
        return data;
    }
    process_data_to_graph(data, order_by, colour_by) {
        var fin_data = {"x": [], "y": []};
        var colouring = [];
        for (var key in data) {
            var sub_colouring = [];
            fin_data.x.push(this.get_pretty_name(key, order_by));
            fin_data.y.push(data[key].length);
            for (var i = 0; i < data[key].length; i++) {
                sub_colouring.push(this.state.task_data[data[key][i]][colour_by]);
            }
            colouring.push(sub_colouring);
        }
        return [fin_data, colouring];
    }

    get_pretty_name(magnitude, type) {
        var pretty_modifier, pretty_name;
        switch (type) {
            case "difficulty":
                pretty_name = "Difficult";
                break;
            case "urgency":
                pretty_name = "Urgent";
                break;
            case "type_id":
                pretty_name = "";
                break;
        }
        if (type == "difficulty" || type == "urgency") {
            switch (magnitude) {
                case "1":
                    pretty_modifier = "Not";
                    break;
                case "2":
                    pretty_modifier = "Quite";
                    break;
                case "3":
                    pretty_modifier = "Mod.";
                    break;
                case "4":
                    pretty_modifier = "Average";
                    break;
                case "5":
                    pretty_modifier = "Very";
                    break;
            }
        }

        return pretty_modifier;
    }

    quick_sort(low, high, sort_by) {
        if (low < high) {
            var partition_index = this.partition(low, high, sort_by);
            this.quick_sort(low, partition_index - 1, sort_by);
            this.quick_sort(partition_index + 1, high, sort_by);
        }
    }
    partition(low, high, sort_by) {
        var temp;
        var pivot = this.state.task_data[this.array_to_sort[high]][sort_by];
        var i = (low - 1);
        for (var j = low; j <= high - 1; j++) {
            if (this.state.task_data[this.array_to_sort[j]][sort_by] < pivot) {
                i++;
                temp = this.array_to_sort[i];
                this.array_to_sort[i] = this.array_to_sort[j];
                this.array_to_sort[j] = temp;
            }
        }
        temp = this.array_to_sort[i + 1];
        this.array_to_sort[i + 1] = this.array_to_sort[high];
        this.array_to_sort[high] = temp;
        return i + 1;
    }
}

class ReviewSegment extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            corners: false,
            minHeight: 44,
            maxHeight: 10000
        }

        this.animation = new Animated.Value(0);

        this.reveal_details.bind(this);
        this.handle_corners.bind(this);
    }

    reveal_details() {
        this.setState({
            open: !this.state.open
        });
    }
    async handle_corners() {
        if (this.state.open) {
            await new Promise((resolve, reject) => setTimeout(resolve, 500));
            if (!this.state.open) {
                this.setState({
                    corners: false
                });
            }
        } else {
            this.setState({
                corners: true
            });
        }
    }

    handlePress() {
        this.reveal_details();
        this.handle_corners();
    }

    componentDidMount() {
        this.container_opening_style = this.animation.interpolate({
            inputRange: [0, 1],
            outputRange: [this.state.minHeight, this.state.minHeight + this.state.maxHeight]
        });
    }
    componentDidUpdate() {
        // Handle container opening
        var opened_amount = this.state.open ? 1 : 0;
        Animated.spring(
            this.animation,
            {
                toValue: opened_amount,
                friction: 30
            }
        ).start();
        this.container_opening_style = this.animation.interpolate({
            inputRange: [0, 1],
            outputRange: [this.state.minHeight, this.state.minHeight + this.state.maxHeight]
        });
    }

    render() {
        let card_opening_style = {height: this.container_opening_style};
        var card_style = [styles.main_card_body];
        if (this.state.corners) {
            const no_corners_style = {borderBottomLeftRadius: 0, borderBottomRightRadius: 0};
            card_style.push(no_corners_style);
        }
        return (
            <View style={styles.review_segment_container}>
                <Animated.View style={[{overflow: 'hidden', width: '100%'}, card_opening_style]}>
                    <TouchableWithoutFeedback onPress={this.handlePress.bind(this)}>
                        <View style={card_style}>
                            <Text style={{marginLeft: 5, fontSize: 16}}>{this.props.segment_name}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <View onLayout={this._setMaxHeight.bind(this)}
                          style={{backgroundColor: COLOUR_SCHEME.highlight, borderBottomRightRadius: 15, borderBottomLeftRadius: 15, overflow: 'hidden', padding: 5}}>
                        {this.props.children}
                    </View>
                </Animated.View>
            </View>
        )
    }

    // Get details for animation
    _setMaxHeight(event) {
        if (this.state.maxHeight == 10000 || this.state.maxHeight < event.nativeEvent.layout.height) {
            this.setState({
                maxHeight: event.nativeEvent.layout.height
            });
        }
    }
}

const styles = StyleSheet.create({
    main_card_body: {
        minHeight: 44,
        padding: 10,
        borderRadius: 15,
        backgroundColor: COLOUR_SCHEME.main,
        justifyContent: 'center'
    },
    review_segment_container: {
        flex: 1,
        flexDirection: 'row',
        margin: 10
    }
})