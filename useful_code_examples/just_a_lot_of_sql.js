import React, { Component } from 'react';
import { Text, TouchableWithoutFeedback, View } from 'react-native';

import * as SQLite from 'expo-sqlite';

export class WeekReview extends Component {
    constructor(props) {
        super(props);

        this.db = SQLite.openDatabase('Productivity_Database');

        this.state = {
            data: "Placeholder",
            forceUpdate: false 
        }

        this.addToDatabaseDefaults.bind(this);
    }

    updateTextField() {
        var response = false;
        var sql = "SELECT * FROM `task_types`";
        this.db.transaction(
            tx => {
                tx.executeSql(
                    sql,
                    [],
                    (_, { rows }) => {
                        response = rows._array;
                        for(var i in response) {
                            var sub_output = "";
                            for (var j in response[i]) {
                                sub_output += " - " + response[i][j];
                            }
                        }
                    }
                )
            },
            null,
            this.update
        )
        this.setState(() => {
            return {
                data: response
            }
        });
    }

    checkSizeOfDatabase() {
        const sql = "SELECT * FROM `task_types`";
        var type_db_empty = false;
        this.db.transaction(
            tx => {
                tx.executeSql(
                    sql,
                    [],
                    (_, { rows }) => {
                        if (rows.length == 0) {
                            alert("Type database empty, adding defaults");
                            this.addToDatabaseDefaults();
                        } else {
                            alert("Type database has registered entries");
                        }
                    }
                )
            },
            null,
            this.update
        )
    }

    addToDatabaseDefaults() {
        alert("Adding new types to Task_types database");
        const work_sql = "INSERT INTO `task_types` (`name`, `colour`) VALUES ('Work', 0)";
        const chores_sql = "INSERT INTO `task_types` (`name`, `colour`) VALUES ('Chores', 1)";
        const social_sql = "INSERT INTO `task_types` (`name`, `colour`) VALUES('Social', 2)";
        this.db.transaction(
            ty => {
                ty.executeSql(work_sql);
                ty.executeSql(chores_sql);
                ty.executeSql(
                    social_sql,
                    [],
                    ()=> {
                        alert("Added new types")
                    }
                )
            },
            null,
            this.update
        )
    }

    fetchColumnNames() {
        const sql = "PRAGMA table_info(Tasks)";
        this.dba.transaction(
            tz => {
                tz.executeSql(
                    sql,
                    [],
                    (_,{ rows }) => {
                        var output = "";
                        for (var i in rows._array) {
                            output += rows._array[i]["name"] + " | ";
                        }
                        this.setState({
                            data: output.substr(0, output.length - 3)
                        })
                    }
                )
            },
            null,
            this.update
        )
    }

    emptyDatabase() {
        alert("Emptying Database");
        const sql = "DELETE FROM 'Task_types'";
        this.db.transaction(
            tx => {
                tx.executeSql(sql)
            },
            null,
            this.update
        )
    }

    render() {
        var finTest = "not updated";
        if (this.state.forceUpdate) {
            finTest = "Force Updated!";
        }

        return(
            <View style={{flex: 1, borderColor: '#f00', borderWidth: 1}}>
                <View style={{padding: 20}}>
                    <Text>Update database text field</Text>
                    <TouchableWithoutFeedback onPress={this.updateTextField.bind(this)}><View style={{height: 20, width: 100, margin: 5, backgroundColor: 'red'}}></View></TouchableWithoutFeedback>
                    <Text>Add to database</Text>
                    <TouchableWithoutFeedback onPress={this.checkSizeOfDatabase.bind(this)}><View style={{height: 20, width: 100, margin: 5, backgroundColor: 'blue'}}></View></TouchableWithoutFeedback>
                    <Text>Force update</Text>
                    <TouchableWithoutFeedback onPress={() => {this.setState(() => {return({forceUpdate: true})})}}><View style={{height: 20, width: 100, margin: 5, backgroundColor: 'yellow'}}></View></TouchableWithoutFeedback>
                    <Text>Alert state.data field</Text>
                    <TouchableWithoutFeedback onPress={() => {alert(this.state.data)}}><View style={{height: 20, width: 100, margin: 5, backgroundColor: 'green'}}></View></TouchableWithoutFeedback>
                    <Text>Empty Database</Text>
                    <TouchableWithoutFeedback onPress={this.emptyDatabase.bind(this)}><View style={{height: 20, width: 100, margin: 5, backgroundColor: 'cyan'}}></View></TouchableWithoutFeedback>
                    <Text style={{marginTop: 30}}>{this.state.data}</Text>
                    <Text>{finTest}</Text>
                </View>
            </View>
        )
    }
}

