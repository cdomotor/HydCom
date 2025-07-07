import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const NotImplemented = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Not implemented</Text>
  </View>
);

const GPSMapScreen = NotImplemented;
const CompassScreen = NotImplemented;
const SunPlotScreen = NotImplemented;

const CrossSectionScreen = NotImplemented;
const GaugeBoardsScreen = NotImplemented;
const GeneralSurveyScreen = NotImplemented;

const SampleScreen = NotImplemented;
const CameraScreen = NotImplemented;

const HydrographyScreen = NotImplemented;
const AboutScreen = NotImplemented;

const LocationStack = createNativeStackNavigator();
const SurveyStack = createNativeStackNavigator();
const ReferenceStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const LocationStackScreen = () => (
  <LocationStack.Navigator>
    <LocationStack.Screen name="GPSMap" component={GPSMapScreen} options={{ title: 'GPS & Map' }} />
    <LocationStack.Screen name="Compass" component={CompassScreen} />
    <LocationStack.Screen name="SunPlot" component={SunPlotScreen} options={{ title: 'Sun Plot' }} />
  </LocationStack.Navigator>
);

const SurveyStackScreen = () => (
  <SurveyStack.Navigator>
    <SurveyStack.Screen name="CrossSection" component={CrossSectionScreen} options={{ title: 'Cross Section' }} />
    <SurveyStack.Screen name="GaugeBoards" component={GaugeBoardsScreen} options={{ title: 'Gauge Boards' }} />
    <SurveyStack.Screen name="GeneralSurvey" component={GeneralSurveyScreen} options={{ title: 'General Survey' }} />
  </SurveyStack.Navigator>
);

const ReferenceStackScreen = () => (
  <ReferenceStack.Navigator>
    <ReferenceStack.Screen name="Hydrography" component={HydrographyScreen} />
    <ReferenceStack.Screen name="About" component={AboutScreen} options={{ title: 'About HydCom' }} />
  </ReferenceStack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    initialRouteName="Location"
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Location: 'map-marker',
          Surveying: 'ruler',
          Sampling: 'flask',
          Camera: 'camera',
          Reference: 'book',
        };
        const name = icons[route.name] || 'circle';
        return <MaterialCommunityIcons name={name} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Location" component={LocationStackScreen} />
    <Tab.Screen name="Surveying" component={SurveyStackScreen} />
    <Tab.Screen name="Sampling" component={SampleScreen} />
    <Tab.Screen name="Camera" component={CameraScreen} />
    <Tab.Screen name="Reference" component={ReferenceStackScreen} />
  </Tab.Navigator>
);

const MainNavigator = () => (
  <NavigationContainer theme={DefaultTheme}>
    <MainTabs />
  </NavigationContainer>
);

export default MainNavigator;
