import React, { Component } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Text, TouchableWithoutFeedback, View } from 'react-native';

import Icon from 'react-native-vector-icons/Entypo';

import { COLOUR_SCHEME, COLOUR_SCALE, TASK_COLOURS } from '../common/global_styling';

import * as SQLite from 'expo-sqlite';

import { Logger, LoggingType } from '../../utilities/logging';

export class Task extends Component {
    constructor(props) {
        super(props);

        this.db = SQLite.openDatabase("Productivity_Database");

        this.state = {
            open: false,
            corners: false,
            minHeight: 44,
            maxHeight: 10000,
            removalPrimed: false
        }

        this.animation = new Animated.Value(0);

        this.reveal_details.bind(this);
        this.handle_corners.bind(this);
    }

    // On short press of task card
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

    // On long press of task card
    // ******************************************************************************************
    // Update comments for this!! This is a long method chain with no notation lol
    // ******************************************************************************************
    toggle_task_running_state() {
        Logger.log(LoggingType.STATUS_VERBOSE, ["Toggling run status of task " + this.props.data.id, "Task now " + (this.props.data.running == 1 ? "paused" : "running")])
        if (this.props.data.running == 1) {
            this.pause_task();
        } else {
            this.start_task();
        }
    }
    start_task() {
        // Updates the database to set the task running and the time it started running at
        const start_running_sql = "UPDATE `Tasks` "
                                + "SET running=1, time_last_run_at=" + Math.floor(Date.now() / 1000) + " "
                                + "WHERE id=" + this.props.data.id;
        this.db.transaction(
            tx => {
                tx.executeSql(
                    start_running_sql,
                    [],
                    () => {
                        Logger.log(LoggingType.NOTICE, "Task " + this.props.data.id + " is now running");
                        this.props.updateTasks();
                    }
                )
            },
            null,
            this.update
        )
    }
    pause_task() {
        // Find time the task stopped running
        const time_ended = Math.floor(Date.now() / 1000);
        // Stop the task running on database
        const pause_sql = "UPDATE `Tasks` "
                        + "SET running=0 "
                        + "WHERE id=" + this.props.data.id;
        this.db.transaction(
            tx => {
                tx.executeSql(
                    pause_sql,
                    [],
                    () => {
                        Logger.log(LoggingType.NOTICE, "Task " + this.props.data.id + " is now paused");
                    }
                );
            },
            null,
            this.update
        )
        // Fetch the time at which the task was started
        const check_time_start_sql = "SELECT time_last_run_at FROM `Tasks` WHERE id=" + this.props.data.id;
        this.db.transaction(
            ty => {
                ty.executeSql(
                    check_time_start_sql,
                    [],
                    (_, { rows }) => {
                        this.determine_time_spent(rows._array[0]["time_last_run_at"], time_ended);
                    }
                )
            },
            null,
            this.update
        )
    }
    determine_time_spent(time_start, time_end) {
        // Determines time spent on task
        var time_spent_this_period = Math.floor((time_end - time_start) / 60);
        var time_spent_so_far = this.props.data.time_spent + time_spent_this_period;
        // Updates tasks table
        const update_time_spent_sql = "UPDATE `Tasks` "
                                    + "SET time_spent=" + time_spent_so_far + " "
                                    + "WHERE id=" + this.props.data.id;
        this.db.transaction(
            tz => {
                tz.executeSql(
                    update_time_spent_sql,
                    [],
                    () => {
                        this.props.updateTasks();
                        Logger.log(LoggingType.STATUS_BRIEF, "The time spent on Task " + this.props.data.id + " has been updated to " + time_spent_so_far);
                    }
                )
            },
            null,
            this.update
        );
    }

    // On requesting removal of a task
    change_priming(value) {
        this.setState({
            removalPrimed: value
        });
    }
    complete_task() {
        const sql = "UPDATE `tasks` SET completed=1 WHERE id=" + this.props.data.id;
        this.db.transaction(
            tx => {
                tx.executeSql(
                    sql,
                    [],
                    () => {
                        this.setState({
                            removalPrimed: false
                        });
                        this.props.updateTasks();
                        Logger.log(LoggingType.STATUS_BRIEF, "Have set Task " + this.props.data.id + " to complete");
                    }
                )
            },
            null,
            this.update
        );
    }

    /**
     * Parses an integer duration in minutes and returns an "hh:mm" string
     * @param {int} time duration in minutes
     */
    getParsedTime(time) {
        var spent_hours = Math.floor(time / 60);
        if (spent_hours < 10) {
            spent_hours = "0" + spent_hours;
        }
        var spent_minutes = time % 60;
        if (spent_minutes < 10) {
            spent_minutes = "0" + spent_minutes;
        }
        return spent_hours + ":" + spent_minutes;
    }

    // Manage opening animation
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
        // Check that task_types defined, otherwise re-render
        // I really need to figure out how to get round this. I think essentially I'll need a loading screen.
        // Either it calls update tasks and when they're initialised then it calls that far more than it should and eventually renders correctly
        // Or it calls the correct method a little less and then renders incorrectly as the initial task render isn't at the correct height.
        // So yeah, as mentioned above think the correct approach is a loading screen but this needs more time than I have at the moment.
        if (this.props.task_type === undefined) {
            this.props.updateTasks();
        }

        // Rename data prop for convenience
        var data = this.props.data;

        // Manage colour coding of tasks
        if (this.props.colour_by !== "type") {
            var task_colour = COLOUR_SCALE[data[this.props.colour_by]];
        } else {
            var task_colour = TASK_COLOURS[this.props.task_colour_id];
        }

        // Determine whether to show stopwatchIcon
        var containerStyle = [styles.container];
        if (data.running == 1) {
            containerStyle.push({shadowColor: 'lime'});
        } else {
            containerStyle.push({shadowColor: 'black'});
        }

        // Get pretty values to render
        // ******************************************************************************************
        // Address this, passing both parse_time function and time value rather than one value??
        // ******************************************************************************************
        var time_left = this.getParsedTime(Math.abs(data.time_predicted - data.time_spent));

        // Manage card opening animation
        let card_opening_style = {height: this.container_opening_style};

        return(
            <View style={containerStyle}>
                <Animated.View style={[{overflow: 'hidden'}, card_opening_style]}>
                    <MainCardBody handle_corners={this.handle_corners.bind(this)}
                                  parse_time={this.getParsedTime.bind(this)}
				                  reveal_details={this.reveal_details.bind(this)}
				                  toggle_task_running_state={this.toggle_task_running_state.bind(this)}
				                  card_colour={task_colour}
                                  has_corners={this.state.corners}
                                  name={data.name}
                                  running={data.running == 1}
                                  time={data.time_predicted - data.time_spent}/>
                    <View style={detail_styles.container} onLayout={this._setMaxHeight.bind(this)}>
                        <DetailsOverview urgency={data.urgency}
                                         difficulty={data.difficulty}
                                         task_type={this.props.task_type}/>
                        <DetailsDivider/>
                        <DetailsTime display_text={"Time Spent:"}
                                     parsed_time={this.getParsedTime(data.time_spent)}/>
                        <DetailsTime display_text={"Time Predicted:"}
                                     parsed_time={this.getParsedTime(data.time_predicted)}/>
                        <DetailsDivider/>
                        <DetailsDescription text={data.description}/>
                        <DetailsDivider/>
                        <DetailsRemoveTask complete_task={this.complete_task.bind(this)}
                                           removal_primed={this.state.removalPrimed}
                                           change_priming={this.change_priming.bind(this)}/>
                    </View>
                </Animated.View>
            </View>
        );
    }

    // Get details for animation
    _setMaxHeight(event) {
        if (this.state.maxHeight == 10000 || this.state.maxHeight < event.nativeEvent.layout.height) {
            this.setState({
                maxHeight: event.nativeEvent.layout.height
            });
        }
    }
    _setMinHeight(event) {
        this.setState({
            minHeight: event.nativeEvent.layout.height
        });
    }
}

class DetailsDescription extends Component {
    render() {
        return(
            <Text style={detail_styles.description}>{this.props.text}</Text>
        )
    }
}
class DetailsDivider extends Component {
    render() {
        return(
            <View style={detail_styles.divider}/>
        )
    }
}
class DetailsOverview extends Component {
    getDescriptiveModifier(magnitude) {
        var modifier = "";
        switch(magnitude) {
            case 1:
                modifier = "Not "
                break;
            case 2:
                modifier = "Quite "
                break;
            case 3:
                modifier = "Moderately ";
                break;
            case 4:
                modifier = "";
                break;
            case 5:
                modifier = "Very ";
                break;
        }
        return modifier;
    }

    render() {
        var urgency_mod = this.getDescriptiveModifier(this.props.urgency);
        var difficulty_mod = this.getDescriptiveModifier(this.props.difficulty);
        return(
            <Text style={detail_styles.overview}>{urgency_mod + "Urgent | " + difficulty_mod + "Difficult | " + this.props.task_type}</Text>
        )
    }
}
class DetailsRemoveTask extends Component {
    constructor(props) {
        super(props);
    }

    handlePress() {
        this.manageRemovalPriming();
        this.manageTimeout();
        
    }
    manageRemovalPriming() {
        if (this.props.removal_primed) {
            this.props.complete_task();
        } else {
            this.props.change_priming(true);
        }
    }
    async manageTimeout() {
        await new Promise((resolve, reject) => setTimeout(resolve, 3000))
        Logger.log(LoggingType.NOTICE, "Have removed priming");
        this.props.change_priming(false);
    }

    render() {
        return(
            <TouchableWithoutFeedback onPress={this.handlePress.bind(this)}>
                <View style={{flexDirection: 'row', alignContent: 'center'}}>
                    <Icon name="trash" color={this.props.removal_primed ? 'red' : COLOUR_SCHEME.dark} size={20} style={[styles.action_icon, {textAlign: this.props.removal_primed ? 'right' : 'center'}]}/>
                    <Text style={{flex: 1, paddingLeft: 5, textAlign: 'left', color: 'red', fontSize: 20, display: this.props.removal_primed ? 'flex' : 'none'}}>Delete?</Text>
                </View>
            </TouchableWithoutFeedback>
        )
    }
}
class DetailsTime extends Component {
    render() {
        return(
            <View style={detail_styles.time_container}>
                <Text style={detail_styles.time_text}>{this.props.display_text}</Text>
                <Text style={detail_styles.time_value}>{this.props.parsed_time}</Text>
            </View>
        )
    }
}

class MainCardBody extends Component {
    handlePress() {
        this.props.reveal_details();
        this.props.handle_corners();
    }

    render() {
        // Manage Container Style
        var card_style = [styles.card, {backgroundColor: this.props.card_colour}];
        if (this.props.has_corners) {
            const no_corners_style = {borderBottomLeftRadius: 0, borderBottomRightRadius: 0};
            card_style.push(no_corners_style);
        }
        // Manage Stopwatch Icon
        var stopwatch_style = [styles.stopwatch, {display: this.props.running ? "flex" : "none"}];
        // Manage Time
        var time_style = [styles.time, {color: this.props.time < 0 ? "red" : "black"}];
        var time_text = this.props.parse_time(Math.abs(this.props.time));
        if (this.props.time < 0) {
            time_text = "-" + time_text;
        }
        
        return(
            <View style={card_style}>
                <TouchableWithoutFeedback onPress={this.handlePress.bind(this)} onLongPress={this.props.toggle_task_running_state}>
                    <View style={styles.main_task_box}>
                        <Text style={styles.name}>{this.props.name}</Text>
                        <Icon name="stopwatch" color="black" size={20} style={stopwatch_style}/>
                        <Text style={time_style}>{time_text}</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }
}

const detail_styles = StyleSheet.create({
    container: {
        height: 'auto',
        borderBottomLeftRadius: 15, 
        borderBottomRightRadius: 15, 
        paddingLeft: 10, 
        paddingRight: 10, 
        paddingBottom: 10, 
        backgroundColor: COLOUR_SCHEME.highlight
    },
    description: {
        color: COLOUR_SCHEME.dark
    },
    divider: {
        height: 1, 
        width: '100%', 
        marginTop: 5, 
        marginBottom: 5, 
        backgroundColor: '#ddd'
    },
    overview: {
        textAlign: 'center', 
        marginTop: 5, 
        color: COLOUR_SCHEME.dark
    },
    time_container: {
        flexDirection: 'row'
    },
    time_text: {
        flex: 2,
        color: COLOUR_SCHEME.dark    
    },
    time_value: {
        flex: 1,
        textAlign: 'right',
        color: COLOUR_SCHEME.dark
    }
});
const styles = StyleSheet.create({
    action_icon: {
        flex: 1,
        justifyContent: 'center'
    },
    container: {
        shadowOffset: {width: 0, height: 2}, 
        shadowOpacity: 0.25, 
        marginBottom: 15
    },
    card: {
        minHeight: 44,
        padding: 10,
        borderRadius: 15
    },
    main_task_box: {
        flexDirection: 'row',
        flex: 2
    },
    name: {
        fontSize: 20
    },
    stopwatch: {
        flex: 1,
        marginTop: 2, 
        marginLeft: 5
    },
    time: {
        flex: 1,
        fontSize: 20,
        textAlign: 'right'
    }
});
