import React, { Component } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { View } from 'react-native';

import * as SQLite from 'expo-sqlite';

import { TopBar } from './common/topbar';
import { MainContent } from './MainContent';
import { BottomBar } from './common/bottombar';

import { Logger, LoggingType } from '../utilities/logging';

import { LOCATIONS } from '../enums/locations';
import { COLOUR_SCHEME, COLOUR_SCALE } from './common/global_styling'

export class Core extends Component {
    constructor(props) {
        super(props);

        this.state = {
            colour_scheme: COLOUR_SCHEME,
            colour_scale: COLOUR_SCALE,
            location: LOCATIONS.task_review,
            side_bar: false,
            sort_by: 'urgency',
            sort_order_ascending: false,
            colour_by: 'urgency',
            updateRequired: false
        }

        this.database = this.initialiseDatabase();
        this.updateLocation = this.updateLocation.bind(this);

        Logger.log(LoggingType.STATUS_BRIEF, "Core Initialised");
    }

    toggleSortOrder() {
        this.setState({
            sort_order_ascending: !this.state.sort_order_ascending,
            updateRequired: true
        });
        Logger.log(LoggingType.NOTICE, "Sort order reversed");
    }
    updateSortBy(sort_by) {
        this.setState({
            sort_by: sort_by,
            updateRequired: true
        });
        Logger.log(LoggingType.NOTICE, "Changed sort by to " + sort_by);
    }
    updateColourBy(colour_by) {
        this.setState({
            colour_by: colour_by,
            updateRequired: true
        });
        Logger.log(LoggingType.NOTICE, "Changed colour by to " + colour_by);
    }
    notifyUpdateTasks() {
        this.setState({
            updateRequired: true
        });
    }
    cancelUpdateTasks() {
        this.setState({
            updateRequired: false
        });
    }

    render() {
        return (
            <View style={styles.core_style}>
                <View style={styles.core_container}>
                    <TopBar 
                        selectSortType={this.updateSortBy.bind(this)} 
                        selectColourType={this.updateColourBy.bind(this)}
                        toggleSortOrder={this.toggleSortOrder.bind(this)}/>
                    <View style={{flex: 11, backgroundColor: COLOUR_SCHEME.light}}>
                        <MainContent location={this.state.location} 
                                     sort_by={this.state.sort_by} 
                                     sort_ascending={this.state.sort_order_ascending}
                                     colour_by={this.state.colour_by} 
                                     notifyUpdateTasks={this.notifyUpdateTasks.bind(this)} 
                                     cancelUpdateTasks={this.cancelUpdateTasks.bind(this)} 
                                     updateRequired={this.state.updateRequired}/>
                    </View>
                </View>
                <BottomBar style={styles.bottom_bar} 
                           onPress={this.updateLocation}/>
            </View>
        )
    }

    updateLocation(new_location) {
        this.setState({
            location: new_location
        });
        Logger.log(LoggingType.NOTICE, "Switched menu to " + new_location.pretty);
    }

    initialiseDatabase() {
        Logger.log(LoggingType.STATUS_BRIEF, "Opening database");
        let db = SQLite.openDatabase("Productivity_Database");
        // Check if default tables required have been created, if not create them
        const table_check_sql = "SELECT name FROM sqlite_master WHERE type='table' AND name='Tasks'";
        db.transaction(
            tx => {
                tx.executeSql(
                    table_check_sql,
                    [],
                    (_, { rows }) => {
                        if (rows.length == 0) {
                            this.createDefaultTables(db);
                        }
                    }
                )
            },
            null,
            this.update
        )
        return db;
    }

    createDefaultTables(db) {
        Logger.log(LoggingType.STATUS_VERBOSE, ["First time initialising database", "Creating tables `Tasks`, `Account_settings` and `Task_types`"])
        const create_task_table_sql = "CREATE TABLE IF NOT EXISTS `Tasks` ("
                                    + "`id` INTEGER PRIMARY KEY, "
                                    + "`name` VARCHAR(30) NOT NULL, "
                                    + "`difficulty` INTEGER NOT NULL, "
                                    + "`type_id` INTEGER NOT NULL, "
                                    + "`urgency` INTEGER NOT NULL, "
                                    + "`time_predicted` INTEGER NOT NULL, "
                                    + "`running` INTEGER DEFAULT 0, "
                                    + "`time_spent` INTEGER DEFAULT 0, "
                                    + "`description` TEXT"
                                    + ")";
        const create_account_settings_sql = "CREATE TABLE IF NOT EXISTS `Account_settings` ("
                                          + "`colour_scheme_choice` INTEGER DEFAULT 0, "
                                          + "`font_family` INTEGER DEFAULT 0, "
                                          + "`border_radius` INTEGER DEFAULT 0"
                                          + ")";
        const create_type_table_sql = "CREATE TABLE IF NOT EXISTS `Task_types` ("
                                    + "`id` INTEGER PRIMARY KEY, "
                                    + "`name` VARCHAR(15) NOT NULL, "
                                    + "`colour` INTEGER NOT NULL"
                                    + ")";
        try {
            db.transaction(
                ty => {
                    ty.executeSql(create_task_table_sql);
                    ty.executeSql(create_account_settings_sql);
                    ty.executeSql(create_type_table_sql);
                },
                null,
                this.update
            ); 
        } catch (err) {
            Logger.log(LoggingType.ERROR, ["Failed to create database", "Relaunching app to attempt database initialisation again"]);
        }
        Logger.log(LoggingType.NOTICE, "Created default tables")
    }
}

const bottom_bar_height = Math.round(Dimensions.get('window').width / 5);
const container_height = Math.round(Dimensions.get('window').height) - 20 - bottom_bar_height;

const styles = StyleSheet.create({
    core_style: {
        flex: 1,
        backgroundColor: COLOUR_SCHEME.dark
    },
    core_container: {
        height: container_height,
        top: 20
    },
    bottom_bar: {
        position: 'absolute',
        bottom: 0,
        height: bottom_bar_height,
        width: '100%',
        flexDirection: 'row'
    }
})