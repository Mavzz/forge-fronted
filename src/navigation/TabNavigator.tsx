import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TodayScreen from '../screens/main/TodayScreen';
import GoalsScreen from '../screens/main/GoalsScreen';
import StreakScreen from '../screens/main/StreakScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{headerShown: false,
        tabBarStyle:     { backgroundColor: '#1A1A1A', borderTopColor: '#2A2A2A' },
        tabBarActiveTintColor:   '#FF6B35',
        tabBarInactiveTintColor: '#555',
    }}>
      <Tab.Screen name="Today" component={TodayScreen} options={{tabBarLabel: 'Today'}} />
      <Tab.Screen name="Goals" component={GoalsScreen} options={{tabBarLabel: 'Goals'}} />
      <Tab.Screen name="Streak" component={StreakScreen} options={{tabBarLabel: 'Streak'}} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{tabBarLabel: 'Profile'}} />
    </Tab.Navigator>
  );
}