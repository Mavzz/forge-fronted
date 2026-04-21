import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Today: undefined;
  Goals: undefined;
  Streak: undefined;
  Profile: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, "Login">;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, "Register">;

export type TodayScreenProps = BottomTabScreenProps<MainTabParamList, "Today">;
export type GoalsScreenProps = BottomTabScreenProps<MainTabParamList, "Goals">;
export type StreakScreenProps = BottomTabScreenProps<MainTabParamList, "Streak">;
export type ProfileScreenProps = BottomTabScreenProps<MainTabParamList, "Profile">;