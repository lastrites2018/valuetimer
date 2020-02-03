import {createAppContainer} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';

import Timer from '~/Components/Timer';
import History from '~/Components/History';

const TabNavigator = createBottomTabNavigator({
  Home: {
    screen: Timer,
  },
  Test: {
    screen: History,
  },
});

export default createAppContainer(TabNavigator);
