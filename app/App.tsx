import React, { FunctionComponent } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './Home';

const Stack = createStackNavigator();

const App: FunctionComponent = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="awal n-rbbi i-kraygatt ass" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
