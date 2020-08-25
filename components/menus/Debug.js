import React, { Component } from 'react';
import { View, Text, TouchableWithoutFeedback, TouchableHighlight } from 'react-native';

import * as SQLite from 'expo-sqlite';
import { BarChart } from '../graphing/BarChart';

import { COLOUR_SCALE } from '../common/global_styling';

export class Debug extends Component {
    constructor(props) {
        super(props);

        this.db = SQLite.openDatabase("Productivity_Database");

        this.state = {
            data: "DB ERROR"
        }

        this.structureData.bind(this)
    }

    addTestTask() {
        var test_name = "Test Task 1";
        var test_difficulty = 1;
        var type_id = 2;
        var test_urgency = 3;
        var time_predicted = 120;
        var test_desc = "Brief test description";
        const insert_sql = "INSERT INTO `Tasks` "
                         + "(name, difficulty, type_id, urgency, time_predicted, description) "
                         + "VALUES "
                         + "('" + test_name + "', " + test_difficulty + ", " + type_id + ", " + test_urgency + ", " + time_predicted + ", '" + test_desc + "')";
        this.db.transaction(
            tx => {
                tx.executeSql(insert_sql),
                null,
                this.update
            }
        )
    }

    fetchAllTaskTypes() {
        const sql = "SELECT * FROM `task_types`";
        this.db.transaction(
            tx => {
                tx.executeSql(
                    sql,
                    [],
                    (_, { rows }) => {
                        for (var i in rows._array) {
                            console.log("Name=" + rows._array[i]["name"] + " | Colour=" + rows._array[i]["colour"])
                        }
                    }
                )
            },
            null,
            this.update
        )
    }   

    clearTasksTable() {
        const sql = "DELETE FROM `Tasks`";
        this.db.transaction(
            tx => {
                tx.executeSql(sql)
            },
            null,
            this.update
        )
    }

    returnColumnNames() {
        const sql = "PRAGMA table_info(`Tasks`)";
        this.db.transaction(
            tx => {
                tx.executeSql(
                    sql,
                    [],
                    (_, { rows }) => {
                        var output = ""
                        for (var i in rows._array) {
                            output += rows._array[i]["name"] + " | ";
                        }
                        alert(output.substr(0, output.length - 3))
                    }
                )
            },
            null,
            this.update
        )
    }

    addCompletedColumn() {
        this.db.transaction(
            tx => {
                tx.executeSql(sql)
            },
            null,
            this.update
        );
    }

    fetchDifficultyData() {
        console.log("Alert 1")
        const sql = "SELECT Difficulty, COUNT(*) AS `Amount` FROM `Tasks` WHERE Completed LIKE 1 GROUP BY Difficulty";
        this.db.transaction(
            tx => {
                tx.executeSql(
                    sql,
                    [],
                    (_, { rows }) => {
                        console.log("Alert 2")
                        console.log(rows._array)
                    }
                )
            },
            null,
            this.update
        );
    }

    fetchAllRelevantData() {
        const sql = "SELECT * FROM `Tasks` WHERE Completed LIKE 1 ORDER BY urgency;";
        this.db.transaction(
            tx => {
                tx.executeSql(
                    sql,
                    [],
                    (_, { rows }) => {
                        this.setState({
                            data: rows._array
                        });
                    }
                )
            },
            null,
            this.update
        );
    }

    // ************************************************************************************************************************
    // Group elements when looping through raw data rather than through remapped data, otherwise you lose urgency ordering
    // Alternatively examine remapping and see if there's a possibility to fix that
    // ************************************************************************************************************************

    structureData(group_by, colour_by_type) {
        // Obtain raw data
        const raw_data = this.state.data;
        // Define outputs
        var colour_by = [], fin_data = {"x": [], "y": []}; 
        // Define variables required to produce final output
        var grouped_data = {};

        // Initial set up depending on how the data's grouped
        switch (group_by) {
            case 'difficulty':
            case 'urgency':
                for (var i = 1; i <= 5; i++) {
                    grouped_data[i] = [];
                    fin_data["x"].push(i.toString());
                }
                break;
        }

        // Remap data to ids
        var remapped_data = {};
        for (var i = 0; i < raw_data.length; i++) {
            remapped_data[raw_data[i]["id"]] = raw_data[i];
        }

        // Group the data
        for (var i = 0; i < raw_data.length; i++) {
            grouped_data[raw_data[i][group_by]].push(raw_data[i].id);
        }

        for (var key in grouped_data) {
            var sub_colour_by = [];
            // Determine the magnitudes of the grouped data and push to fin_data
            fin_data.y.push(grouped_data[key].length);
            // Determine the colouring of bars by colour_by
            console.log("new group")
            for (var i = 0; i < grouped_data[key].length; i++) {
                console.log(remapped_data[grouped_data[key][i]].urgency)
                sub_colour_by.push(remapped_data[grouped_data[key][i]][colour_by_type]);
            }
            colour_by.push(sub_colour_by);
        }

        console.log("Beginning output of data");
        console.log("##########################################################################################");
        console.log("Grouped data: ");
        console.log(grouped_data)
        console.log("##########################################################################################");
        console.log("Colour by: ");
        console.log(colour_by);
        console.log("##########################################################################################");
        console.log("Final data: ");
        console.log(fin_data);
        console.log("##########################################################################################");

        this.setState({
            fin_data: fin_data,
            colour_by: colour_by
        });
    }

    render() {
        var data = {"x": ["null"], "y": [0]}, colour_by = {};
        if (this.state.fin_data !== undefined) {
            data =      this.state.fin_data;
            colour_by = this.state.colour_by;
        }
        return(
            <View style={{flex: 1}}>
                <View style={{padding: 20}}>
                    <TouchableWithoutFeedback onPress={this.fetchAllRelevantData.bind(this)}><View style={{height: 50, width: 50, backgroundColor: 'yellow'}}></View></TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={() => {this.structureData('difficulty', 'urgency')}}><View style={{height: 50, width: 50, backgroundColor: 'cyan'}}></View></TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={this.addTestTask.bind(this)}><View style={{height: 20, width: 20, backgroundColor: 'purple', marginTop: 10}}></View></TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={this.clearTasksTable.bind(this)}><View style={{height: 20, width: 20, backgroundColor: 'red', marginTop: 10}}></View></TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={this.returnColumnNames.bind(this)}><View style={{height: 20, width: 20, backgroundColor: 'green', marginTop: 10}}></View></TouchableWithoutFeedback>
                    <TouchableHighlight onPress={this.addCompletedColumn.bind(this)}><View style={{height: 20, width: 20, backgroundColor: 'blue', marginTop: 10}}></View></TouchableHighlight>
                </View>
                <View style={{flex: 1}}>
                    <BarChart data={data}
                              colour_by={colour_by} 
                              colour_scheme={COLOUR_SCALE}/>
                </View>
            </View>
        )
    }
}