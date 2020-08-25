import React, { Component } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

import { COLOUR_SCHEME } from './global_styling';

import { LOCATIONS } from '../../enums/locations';

export class BottomBar extends Component {
    /* First button will be home button
     * Second add a task 
     */
    render() {
        var container_style = [this.props.style, {backgroundColor: COLOUR_SCHEME.dark}];
        return(
            <View style={container_style}>
                <TouchableWithoutFeedback onPressIn={() => this.props.onPress(LOCATIONS.home)}>
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <Icon name='bars' size={48} color={COLOUR_SCHEME.main}/>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPressIn={() => this.props.onPress(LOCATIONS.add_task)}>
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <Icon name='plus' size={48} color={COLOUR_SCHEME.main}/>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPressIn={() => this.props.onPress(LOCATIONS.week_review)}>
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <Icon name='bar-chart' size={48} color={COLOUR_SCHEME.main}/>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPressIn={() => this.props.onPress(LOCATIONS.task_review)}>
                    <View style={{flex: 1, borderColor: '#0ff', borderWidth: 1}}></View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPressIn={() => this.props.onPress(LOCATIONS.testing)}>
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <Icon name='bug' size={48} color={COLOUR_SCHEME.main}/>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}