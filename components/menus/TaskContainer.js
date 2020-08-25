import React, { Component } from 'react';
import { FlatList, SafeAreaView, View } from 'react-native';

import { Task } from './Task';

import * as SQLite from 'expo-sqlite';

import { Logger, LoggingType } from '../../utilities/logging';

/**
 * Component which represents all the tasks in a scrollable flat list.
 * One of the main pages of the app
 * @this taskTypes and @this taskColours contain data about the different task categories
 * @this state.taskData contains all the task data necessary
 */
export class TaskContainer extends Component {

    constructor(props) {
        super(props);

        this.db = SQLite.openDatabase("Productivity_Database");

        this.taskTypes = {};
        this.taskColours = {};

        this.state = {
            taskData: "DB ERROR"
        }

        this.fetchTaskTypeData.bind(this);
    }

    componentDidMount() {
        this.updateTasks();
        this.fetchTaskTypeData();
    }

    componentDidUpdate() {
        if (this.props.updateRequired) {
            this.props.cancelUpdate();
            this.updateTasks();
        }
    }

    render() {
        return(
            <SafeAreaView style={{flex: 1}}>
                <View style={{flex: 1, margin: 20}}>
                    <FlatList
                        data={this.state.taskData}
                        renderItem={
                            ({item, rowId}) => <Task data={item} 
                                                     task_type={this.taskTypes[item.type_id]} 
                                                     task_colour_id={this.taskColours[item.type_id]}
                                                     running={item.running == 1} 
                                                     colour_by={this.props.colour_by}
                                                     updateTasks={this.updateTasks.bind(this)}/>
                        }
                        keyExtractor={(item, rowId) => rowId.toString()}
                        style={{padding: 5}}/>
                </View>
            </SafeAreaView>
        )
    }
    
    /**
     * Database request which updates two properties of the component:
     * @this taskTypes and @this taskColours
     */
    fetchTaskTypeData() {
        Logger.log(LoggingType.STATUS_BRIEF, "Fetching Task Types for Task Container");
        const sql = "SELECT id, name, colour FROM `Task_Types`";
        this.db.transaction(
            tx => {
                tx.executeSql(
                    sql,
                    [],
                    (_, { rows }) => {
                        for (var i in rows._array) {
                            this.taskTypes[rows._array[i]["id"]] = rows._array[i]["name"]
                            this.taskColours[rows._array[i]["id"]] = rows._array[i]["colour"]
                        }
                    }
                );
            },
            null,
            this.update
        )
    }

    /**
     * Database request which fetches all the task data and updates the state of the component with it
     * @this state.taskData
     */
    // This function is called like a fuck ton and perhaps need to fix this...
    updateTasks() {
        // Logger.log(LoggingType.STATUS_BRIEF, "Updating task data")
        var ascending_or_descending = this.props.sort_ascending ? " ASC" : " DESC";
        var taskSelectionSql = "SELECT * FROM `Tasks` " // Selects all data from tasks
                             + "WHERE Completed LIKE 0 " // Filters for non-complete tasks
                             + "ORDER BY " + this.props.sort_by + ascending_or_descending // Determines what to sort by and whether ascending or descending
        this.db.transaction(
            tx => {
                tx.executeSql(
                    taskSelectionSql,
                    [],
                    (_, { rows }) => {
                        this.setState({
                            taskData: rows._array
                        });
                    }
                )
            },
            null,
            this.update
        );
    }
}