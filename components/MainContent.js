import React, { Component } from 'react';
import { View } from 'react-native';
import { Animated, Dimensions, Easing, StyleSheet }  from 'react-native';

import { AddTask } from './menus/AddTask';
import { BarChart } from './graphing/TestNegativeChart';
import { Debug } from './menus/Debug';
import { ReviewPage } from './menus/ReviewPage';
import { TaskContainer } from './menus/TaskContainer';

export class MainContent extends Component {
    constructor(props) {
        super(props);

        this.xTranslate = new Animated.Value(this.props.location.code);
    }

    render() {

        const screen_width = Math.round(Dimensions.get('window').width);
        let negative_left = - 4 * screen_width;
        let contentMoveX = this.xTranslate.interpolate({
            inputRange: [0, 4],
            outputRange: [0, negative_left]
        });
        let translateStyle = { transform: [{ translateX: contentMoveX}] };

        return(
            <Animated.View style={[style.container, translateStyle]}>
                <TaskContainer updateRequired={this.props.updateRequired} 
			                   cancelUpdate={this.props.cancelUpdateTasks} 
                               sort_by={this.props.sort_by} 
                               sort_ascending={this.props.sort_ascending}
			                   colour_by={this.props.colour_by}/>
                <AddTask updateTaskList={this.props.notifyUpdateTasks}/>
                <ReviewPage />
                <View style={{flex: 1, borderColor: '#0ff', borderWidth: 1}}>
                    <BarChart data={{x: ["Test 1", "Test 2", "Test 3"], y: [-3, 5, 1]}}
                              colour_by={[[1, 0, 0], [1, 1, 0, 0, 0], [0]]}
                              colour_scheme={{"0": "blue", "1": "red"}}/>
                </View>
                <Debug/>
            </Animated.View>
        )
    }


    componentDidUpdate() {
        Animated.spring(
            this.xTranslate, {
                toValue: this.props.location.code,
                friction: 8,
                easing: Easing.elastic
            }
        ).start();
    }
}

const style = StyleSheet.create({
    container: {
        width: "500%",
        height: "100%",
        flexDirection: "row",
        position: "absolute"
    }
});