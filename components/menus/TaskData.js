import React, { Component } from 'react';
import { Text, View } from 'react-native';

export class TaskData extends Component {
    render() {
        return(
            <View style={{borderWidth: 1, borderColor: 'red', padding: 10}}>
                <View style={{flex: 1, borderWidth: 1, borderColor: 'blue'}}>
                    <Text>{"Id: " + this.props.data.id}</Text>
                    <Text>{"Name: " + this.props.data.name}</Text>
                    <Text>{"Difficulty: " + this.props.data.difficulty}</Text>
                    <Text>{"Type_ID: " + this.props.data.type_id}</Text>
                    <Text>{"Urgency: " + this.props.data.urgency}</Text>
                    <Text>{"Time Predicted: " + this.props.data.time_predicted}</Text>
                    <Text>{"Running: " + this.props.data.running}</Text>
                    <Text>{"Time Spent: " + this.props.data.time_spent}</Text>
                    <Text>{"Description: " + this.props.data.description}</Text>
                    <Text>{"Time last run: " + this.props.data.time_last_run_at}</Text>
                </View>
            </View>
        )
    }
}
