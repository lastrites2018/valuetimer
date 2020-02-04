import {createAppContainer, SafeAreaView} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';

import React from 'react';
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  IconElement,
} from '@ui-kitten/components';
import {ImageStyle} from 'react-native';

import Timer from '~/Components/Timer';
import History from '~/Components/History';

const ClockIcon = (style: ImageStyle): IconElement => (
  <Icon {...style} name="clock-outline" />
);
const ListIcon = (style: ImageStyle): IconElement => (
  <Icon {...style} name="list-outline" />
);

const TabBarComponent = ({navigation}) => {
  const onSelect = index => {
    const selectedTabRoute = navigation.state.routes[index];
    navigation.navigate(selectedTabRoute.routeName);
  };

  return (
    <SafeAreaView>
      <BottomNavigation
        selectedIndex={navigation.state.index}
        onSelect={onSelect}>
        <BottomNavigationTab icon={ClockIcon} />
        <BottomNavigationTab icon={ListIcon} />
      </BottomNavigation>
    </SafeAreaView>
  );
};

const TabNavigator = createBottomTabNavigator(
  {
    Timer: {
      screen: Timer,
    },
    History: {
      screen: History,
    },
  },
  {
    tabBarComponent: TabBarComponent,
  },
);

export default createAppContainer(TabNavigator);
