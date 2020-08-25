import React, { Component } from 'react';
import { Picker, StyleSheet, Text, View } from 'react-native';

export class TimePicker extends Component {
    constructor(props) {
        super(props);
    }

    onMinuteChange(value) {
        this.props.onMinuteChange(value)
    }
    
    onHourChange(value) {
        this.props.onHourChange(value)
    }

    render() {
        var hrs = [];
        hrs.push(<Picker.Item key={0} label={'hh'} value={'h'}/>);
        for (var i = 0; i <= 24; i++) {
            var lbl = i.toString();
            if (i < 10) {
                lbl = "0" + lbl;
            }
            hrs.push(<Picker.Item key={i + 1} label={lbl} value={i}/>);
        }
        var mins = [];
        mins.push(<Picker.Item key={0} label={'mm'} value={'m'}/>);
        for (var i = 0; i <= 60; i++) {
            var lbl = i.toString();
            if (i < 10) {
                lbl = "0" + lbl;
            }
            mins.push(<Picker.Item key={i + 1} label={lbl} value={i}/>);
        }

        var hour_item_style = [styles.item_style];
        var minute_item_style = [styles.item_style];

        if (this.props.timeInvalid[0]) {
            hour_item_style.push({color: 'red'});
        }
        if (this.props.timeInvalid[1]) {
            minute_item_style.push({color: 'red'});
        }

        return(
            <View style={styles.container}>
                <View style={styles.picker_container}>
                    <Picker
                        style={styles.picker_style}
                        itemStyle={hour_item_style}
                        selectedValue={this.props.hours}
                        onValueChange={(itemValue, itemIndex) => {
                            this.onHourChange(itemValue);
                        }}>
                            {hrs}
                    </Picker>
                </View>
                <Text style={styles.divider_style}>:</Text>
                <View style={styles.picker_container}>
                    <Picker
                        style={styles.picker_style}
                        itemStyle={minute_item_style}
                        selectedValue={this.props.minutes}
                        onValueChange={(itemValue, itemIndex) => {
                            this.onMinuteChange(itemValue);
                        }}>
                        {mins}
                    </Picker>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%', 
        flexDirection: 'row'
    },
    picker_container: {
        width: '12%',
        margin: 5
    },
    picker_style: {
    },
    item_style: {
        height: 45,
        fontSize: 24 
    },
    divider_style: {
        marginTop: 11,
        fontSize: 24 
    }
})