import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native';

import { Slider as BaseSlider } from 'react-native-elements';

import { COLOUR_SCHEME } from '../../common/global_styling';

export class Slider extends Component {
    constructor(props) {
        super(props);
    }

    change(value) {
        this.props.update(value)
    }

    render() {
        return(
            <View>
                <BaseSlider
                    value={this.props.value}
                    onValueChange={(value) => {this.change(value)}}
                    step={1}
                    minimumValue={1}
                    maximumValue={5}
                    style={{zIndex: 30}}
                    thumbStyle={[styles.thumb, {backgroundColor: COLOUR_SCHEME.dark}]}
                    minimumTrackTintColor={COLOUR_SCHEME.main}
                    maximumTrackTintColor={'#ddd'}
                />
                <View style={[styles.marker_line, {left: '3%'}]}></View>
                <View style={[styles.marker_line, {left: '26.5%'}]}></View>
                <View style={[styles.marker_line, {left: '50%'}]}></View>
                <View style={[styles.marker_line, {left: '73.5%'}]}></View>
                <View style={[styles.marker_line, {left: '97%'}]}></View>
                <View style={styles.marker_text_container}>
                    <Text style={[styles.marker_text, {left: '2.5%'}]}>1</Text>
                    <Text style={[styles.marker_text, {left: '25.6%'}]}>2</Text>
                    <Text style={[styles.marker_text, {left: '49.1%'}]}>3</Text>
                    <Text style={[styles.marker_text, {left: '72.3%'}]}>4</Text>
                    <Text style={[styles.marker_text, {left: '96%'}]}>5</Text>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    thumb: {
    },
    track: {
    },
    marker_line: {
        position: 'absolute',
        top: '50%',
        zIndex: 29,
        backgroundColor: '#ddd',
        width: 3,
        height: 7,
        borderRadius: 5
    },
    marker_text: {
        position: 'absolute',
        textAlign: 'center'
    },
    marker_text_container: {
        position: 'absolute',
        top: '70%',
        width: '100%',
        flexDirection: 'row'
    }
});