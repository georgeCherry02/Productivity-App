import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Core } from './components/Core';

import { Logger, LoggingType } from './utilities/logging';

export default function App() {
  Logger.log(LoggingType.STATUS_BRIEF, "New Instance");
  return (
    <View style={styles.container}>
      <Core></Core>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'stretch',
  }
});
