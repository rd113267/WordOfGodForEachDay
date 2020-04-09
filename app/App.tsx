import React, { FunctionComponent, useEffect } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import Home from './Home';

const Stack = createStackNavigator();

const App: FunctionComponent = () => {
  useEffect(() => {
    auth().signInAnonymously();
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="awal n-rbbi i-kraygatt ass" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
