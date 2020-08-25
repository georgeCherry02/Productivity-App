import React, { Component } from 'react';
import { Animated, Dimensions, Easing, StyleSheet } from 'react-native';
import { Text, TouchableWithoutFeedback, View } from 'react-native';

import Icon from 'react-native-vector-icons/AntDesign'

import { COLOUR_SCHEME } from './global_styling';

export class TopBar extends Component {
    render() {
        return(
            <View style={style.container}>
                <TopSection style={[style.top_section, {backgroundColor: COLOUR_SCHEME.dark}]}></TopSection>
                <BottomSection selectSortType={this.props.selectSortType}
                               selectColourType={this.props.selectColourType}
                               toggleSortOrder={this.props.toggleSortOrder}/>
            </View>
        )
    }
}

class TopSection extends Component {
    render() {
        return(
            <View style={this.props.style}>
                <View style={{flex: 1, borderColor: '#00f', borderWidth: 1}}></View>
                <View style={{flex: 4, borderColor: '#0f0', borderWidth: 1}}></View>
                <View style={{flex: 1, borderColor: '#f00', borderWidth: 1}}></View>
            </View>
        )
    }
}

class BottomSection extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sort_options_visible: false,
            colour_options_visible: false
        }
    }

    toggleSortOptions() {
        this.setState({
            sort_options_visible: !this.state.sort_options_visible
        });
    }

    toggleColourOptions() {
        this.setState({
            colour_options_visible: !this.state.colour_options_visible
        });
    }

    render() {
        return(
            <View style={[style.bottom_section, {backgroundColor: COLOUR_SCHEME.main}]}>
                <View style={{flex: 1}}></View>
                <TouchableWithoutFeedback onPress={this.toggleSortOptions.bind(this)}>
                    <Text style={{flex: 4, textAlign: 'center'}}>Sort by</Text>
                </TouchableWithoutFeedback>
                <View style={{flex: 1}}></View>
                <TouchableWithoutFeedback onPress={this.toggleColourOptions.bind(this)}>
                    <Text style={{flex: 4, textAlign: 'center'}}>Colour by</Text>
                </TouchableWithoutFeedback>
                <View style={{flex: 1}}></View>
                <OptionsBar type={"sort"}
                            close={this.toggleSortOptions.bind(this)} 
                            visible={this.state.sort_options_visible} 
                            selectType={this.props.selectSortType} 
                            swapOrder={this.props.toggleSortOrder}
                            style={[style.options_bar, {backgroundColor: COLOUR_SCHEME.main}]}/>
                <OptionsBar type={"colour"}
                            close={this.toggleColourOptions.bind(this)} 
                            visible={this.state.colour_options_visible} 
                            selectType={this.props.selectColourType} 
                            style={[style.options_bar, {backgroundColor: COLOUR_SCHEME.dark}]}/>
            </View>
        )
    }
}

class OptionsBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selected_option: "urgency",
            ascending: false
        }

        this.xTranslate = new Animated.Value(this.props.visible ? 1 : 0);
        this.ascendingRotate = new Animated.Value(0);
    }

    componentDidUpdate() {
        var translate_input = this.props.visible ? 1 : 0;
        Animated.spring(
            this.xTranslate, 
            {
                toValue: translate_input,
                friction: 8,
                easing: Easing.elastic
            }
        ).start();
        Animated.timing(
            this.ascendingRotate,
            {
                toValue: this.state.ascending ? 1 : 0,
                duration: 300,
                easing: Easing.linear,
                useNativeDriver: true
            }
        ).start();
    }

    reverseOrder() {
        if (this.props.type == "sort") {
            this.props.swapOrder();
            this.setState({
                ascending: !this.state.ascending
            });
        }
    }

    updateSelection(type) {
        this.setState({
            selected_option: type
        });
        this.props.selectType(type);
    }

    render() {
        // Sort out whether bar is visible
        const screen_width = Math.round(Dimensions.get('window').width);
        let left = screen_width;
        let sortBarMoveX = this.xTranslate.interpolate({
            inputRange: [0, 1],
            outputRange: [left, 0]
        });
        let translateStyle = {transform: [{translateX: sortBarMoveX}]};
        let ascendingIconRotate = this.ascendingRotate.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "-180deg"]
        });
        let rotateStyle = {transform: [{rotate: ascendingIconRotate}]}
        var left_space_style = [{flex: 1, alignContent: 'center', justifyContent: 'center'}];
        if (this.props.type == "sort") {
           left_space_style.push(rotateStyle);
        }

        // Sort out which type is selected
        const selected_style = {textDecorationLine: 'underline'};
        var urgency_style = [style.option_text];
        var time_type_style = [style.option_text];
        var difficulty_style = [style.option_text];

        switch(this.state.selected_option) {
            case "urgency":
                urgency_style.push(selected_style);
                break;
            case "time_predicted":
                time_type_style.push(selected_style);
                break;
            case "difficulty":
                difficulty_style.push(selected_style);
                break;
        }

        // Determine whether to show change order chevron
        const order_jsx = <Icon name='down' size={16} style={{textAlign: 'center', transform: [{translateY: 1}]}}/>;
        return(
            <Animated.View style={[this.props.style, translateStyle]}>
                <TouchableWithoutFeedback onPress={this.reverseOrder.bind(this)}>
                    <Animated.View style={left_space_style}>
                        {this.props.type == "sort" ? order_jsx : <View/>}
                    </Animated.View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => {this.updateSelection('urgency')}}><Text style={urgency_style}>Urgency</Text></TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => {this.updateSelection(this.props.type == "sort" ? "time_predicted" : "type")}}><Text style={time_type_style}>{this.props.type == "sort" ? "Time" : "Type"}</Text></TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => {this.updateSelection('difficulty')}}><Text style={difficulty_style}>Difficulty</Text></TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={this.props.close}>
                    <View style={{flex: 1, alignContent: 'center', justifyContent: 'center'}}>
                        <Icon name='right' size={16} style={{textAlign: 'center'}}/>
                    </View>
                </TouchableWithoutFeedback>
            </Animated.View>
        )
    }
}

const style = StyleSheet.create({
    container: {
        flex: 2
    },
    top_section: {
        flex: 2,
        flexDirection: 'row'
    },
    bottom_section: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    options_bar: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignContent: 'center',
        zIndex: 20,
        flexDirection: 'row'
    },
    option_text: {
        flex: 2,
        textAlign: 'center',
        padding: 5
    }
});