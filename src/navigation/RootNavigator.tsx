import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import TabNavigator from "./TabNavigator";
import AuthNavigator from "./AuthNavigator";
import { useAppStore } from "../store/useAppStore";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function RootNavigator() {
  const token = useAppStore(s => s.accessToken);

  React.useEffect(() => {
    if ( !navigationRef.isReady()) return;

    const targetRoute = token ? "Main" : "Auth";
    const currentRoute = navigationRef.getCurrentRoute()?.name;

    if (currentRoute !== targetRoute) {
      navigationRef.resetRoot({
        index: 0,
        routes: [{ name: targetRoute }],
      });
    }
  }, [token]);

  return (
    <NavigationContainer
      ref={navigationRef}
    >
      <Stack.Navigator
        initialRouteName={token ? "Main" : "Auth"}
        screenOptions={{headerShown: false, animation: 'fade'}}
      >
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}