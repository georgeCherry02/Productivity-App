import React, { Component } from 'react';
import { Picker, Text, TextInput, TouchableWithoutFeedback, View  } from 'react-native';
import { StyleSheet } from 'react-native';

import { Slider } from './common/Slider';
import { TimePicker } from './common/TimePicker';

import * as SQLite from 'expo-sqlite';

import { Logger, LoggingType } from '../../utilities/logging';

export class AddTask extends Component {
    constructor(props) {
        super(props);

        this.db = SQLite.openDatabase("Productivity_Database");

        this.state = {
            name: "",
            difficulty: 1,
            urgency: 1,
            availableTypes: {},
            hours: 'h',
            minutes: 'm',
            type: 'none',
            desc: "",
            validation: "" 
        }

        this.updateUrgency.bind(this);
    }

    // Function chain to update task types available
    updateAvailableTaskTypes() {
        Logger.log(LoggingType.NOTICE, "Updating available task types to pick from");
        const sql = "SELECT `name` FROM `Task_types`";
        this.db.transaction(
            tx => {
                tx.executeSql(
                    sql,
                    [],
                    (_,{ rows }) => {
                        this.setState({availableTypes: rows._array})
                    }
                )
            },
            null
        )
    }
    // Assembles picker that allows selection of task types
    createTypeChoices() {
        var result = []
        result.push(<Picker.Item key={0} label={'Task Type'} value={'none'}/>)
        for (var i in this.state.availableTypes) {
            result.push(<Picker.Item key={i + 1} label={this.state.availableTypes[i]["name"]} value={this.state.availableTypes[i]["name"]}/>);
        }
        return result;
    }

    // Function chain to add a task to database
    // Essentially checks for validation and then sets of chain to add
    submitTask() {
        Logger.log(LoggingType.STATUS_BRIEF, "Validating Task submission");
        if (this.validateTaskSubmission()) {
            this.determine_type_id();
        }
    }
    // A task to determine the id of the task type submitted
    // Yes this probably could have been worked around had I had better design
    determine_type_id() {
        Logger.log(LoggingType.NOTICE, "Determining task type for submission");
        const sql = "SELECT `id` FROM `Task_Types` WHERE name='" + this.state.type + "'";
        this.db.transaction(
            tx => {
                tx.executeSql(
                    sql,
                    [],
                    (_,{ rows }) => {
                        var type_id = rows._array[0]["id"];
                        this.addTaskToDatabase(type_id);
                    }
                )
            },
            null,
            this.update
        );
    }
    // Function that actually goes and adds the task to the database
    addTaskToDatabase(type_id) {
        Logger.log(LoggingType.STATUS_BRIEF, "Adding task to database");
        var time_predicted = this.state.minutes + this.state.hours * 60;
        const insert_sql = "INSERT INTO `Tasks` "
                         + "(name, difficulty, type_id, urgency, time_predicted, description) "
                         + "VALUES "
                         + "('" + this.state.name + "', " + this.state.difficulty + ", " + type_id + ", " + this.state.urgency + ", " + time_predicted + ", '" + this.state.desc + "')";
        this.db.transaction(
            ty => {
                ty.executeSql(
                    insert_sql,
                    [],
                    (_, { rows }) => {
                        Logger.log(LoggingType.STATUS_BRIEF, "Added task '" + this.state.name + "' to database");
                        this.updateGUI();
                    }
                )
            },
            null,
            this.update
        )
    }
    updateGUI() {
        Logger.log(LoggingType.NOTICE, "Refreshing Add Task GUI");
        this.setState({
            name: "",
            difficulty: 1,
            urgency: 1,
            availableTypes: {},
            hours: 'h',
            minutes: 'm',
            type: 'none',
            desc: ''
        });
        this.props.updateTaskList();
    }

    /**
     * Determines if enough information has been gathered to submit the task,
     * Returns a boolean with the result and updates the state with element required for validation if false
     */
    validateTaskSubmission() {
        // Validate Name
        if (this.state.name == "") {
            this.setState({
                validation: "name"
            });
            Logger.log(LoggingType.STATUS_VERBOSE, ["Invalid task name", "Task submission failed"]);
            return false;
        }
        // Validate type
        if (this.state.type == 'none') {
            Logger.log(LoggingType.STATUS_VERBOSE, ["Invalid task type", "Task submission failed"]);
            this.setState({
                validation: 'type'
            });
            return false;
        }
        // Validate Time
        var hours = this.state.hours, minutes = this.state.minutes;
        if ((hours == "h" && minutes == "m") || (hours == 0 && minutes == 0)) {
            Logger.log(LoggingType.STATUS_VERBOSE, ["Invalid task duration", "Hours and Minutes unset or total duration is 0", "Task submission failed"]);
            this.setState({
                validation: 'time-both'
            });
            return false;
        }
        if (hours == "h") {
            Logger.log(LoggingType.STATUS_VERBOSE, ["Invalid task duration", "Hours unset", "Task submission failed"]);
            this.setState({
                validation: 'time-hours'
            });
            return false;
        }
        if (minutes == "m") {
            Logger.log(LoggingType.STATUS_VERBOSE, ["Invalid task duration", "Minutes unset", "Task submission failed"]);
            this.setState({
                validation: 'time-minutes'
            });
            return false;
        }
        return true;
    }

    // Removes any validation faults from state
    removeValidation() {
        Logger.log(LoggingType.NOTICE, "Refreshing task submission validation status");
        this.setState({
            validation: ""
        })
    }

    // Functions to gather information from components
    updateUrgency(value) {
        this.setState(() => {
            return {
                urgency: value
            }
        })
    }
    updateDifficulty(value) {
        this.setState(() => {
            return {
                difficulty: value
            }
        })
    }
    updateHours(value) {
        this.removeValidation();
        if (value == "h") {
            value = 0;
        }
        this.setState(() => {
            return {
                hours: value
            }
        })
    }
    updateMinutes(value) {
        this.removeValidation();
        if (value == "m") {
            value = 0;
        }
        this.setState(() => {
            return {
                minutes: value
            }
        })
    }

    componentDidMount() {
        this.updateAvailableTaskTypes();
    }

    render() {
        var name_colour = "#bbb";
        var task_type_item_style = [styles.picker_item];
        var time_invalid = [false, false];
        switch(this.state.validation) {
            case "":
                break;
            case "name": 
                name_colour = "red";
                break;
            case "type":
                task_type_item_style.push({color: 'red'});
                break;
            case "time-both":
                time_invalid = [true, true];
                break;
            case "time-hours": 
                time_invalid = [true, false];
                break;
            case "time-minutes":
                time_invalid = [false, true];
                break;
        }
        return(
            <View style={{flex: 1}}>
                <View style={{flex: 1, padding: 20}}>
                    <Text style={{fontSize: 24, marginBottom: 10}}>Add a task!</Text>
                    <TextInput value={this.state.name} onChangeText={(value) => {this.removeValidation(); this.setState({name: value})}} placeholder="Task name" placeholderTextColor={name_colour} maxLength={30} style={{marginBottom: 20, fontSize: 20}}></TextInput>
                    <Text>Difficulty</Text>
                    <Slider
                        value={this.state.difficulty}
                        update={this.updateDifficulty.bind(this)}
                    />
                    <Text style={{marginTop: 20}}>Urgency</Text>
                    <Slider
                        value={this.state.urgency}
                        update={this.updateUrgency.bind(this)}
                    />
                    <Picker
                        style={{marginTop: 10}}
                        selectedValue={this.state.type}
                        mode={'dropdown'}
                        itemStyle={task_type_item_style}
                        onValueChange={(itemValue, itemIndex) => {
                            this.removeValidation();
                            this.updateAvailableTaskTypes();
                            this.setState({type: itemValue});
                        }}>
                        {
                            this.createTypeChoices()
                        }
                    </Picker>
                    <Text>Duration</Text>
                    <TimePicker
                        timeInvalid={time_invalid}
                        hours={this.state.hours}
                        minutes={this.state.minutes}
                        onHourChange={this.updateHours.bind(this)}
                        onMinuteChange={this.updateMinutes.bind(this)}/>
                    <View
                        style={{
                            flex: 1,
                            padding: 5,
                            backgroundColor: '#fff',
                            shadowColor: 'black', 
                            shadowOffset: {
                                width: 2,
                                height: 2 
                            },
                            shadowOpacity: 0.5,
                            shadowRadius: 3
                        }}>
                        <TextInput
                            placeholderTextColor={'#ccc'}
                            placeholder={'Description...'}
                            value={this.state.desc}
                            multiline={true}
                            onChangeText={(value) => {
                                this.setState({desc: value});
                            }}/>
                    </View>
                    <TouchableWithoutFeedback
                        onPress={this.submitTask.bind(this)}>
                            <View 
                                style={{
                                    flex: 1,
                                    marginTop: 10
                                }}>
                                <Text>Add Task</Text>
                            </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    picker_item: {
        fontSize: 16,
        height: 80 
    }
});