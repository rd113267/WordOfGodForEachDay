import React, { FunctionComponent } from 'react';
// import 'react-native-gesture-handler';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
import Home from './Home';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

//const Stack = createStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'rgb(46,56,143)',
    accent: 'rgb(46,56,143)'
    //accent: 'rgb(235,50,35)',
  },
};

const App: FunctionComponent = () => {
  return (
    <PaperProvider theme={theme}>
      <Home />
      {/* <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="awal n-rbbi i-kraygatt ass" component={Home} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer> */}
    </PaperProvider>
  );
};

export default App;
