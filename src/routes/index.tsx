import React from 'react';
import {
  NavigationContainer,
  DefaultTheme, useNavigation, CommonActions,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  BottomTabBar,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { AntDesign, Foundation, FontAwesome } from '@expo/vector-icons';
import { Box, IconButton } from 'native-base';
import { StyleSheet, Platform, View } from 'react-native';

import translate from '../i18n/locale';
import { useThemeColors } from '../lib/common';

// Screens
import OauthScreen from '../components/Screens/OauthScreen';
import HomeScreen from '../components/Screens/HomeScreen';
import FiltersScreen from '../components/Screens/FiltersScreen';
import ChartScreen from '../components/Screens/ChartScreen';
import TransactionCreateScreen from '../components/Screens/TransactionCreateScreen';
import TransactionsScreen from '../components/Screens/TransactionsScreen';
import TransactionDetailScreen from '../components/Screens/TransactionDetailScreen';
import ConfigurationScreen from '../components/Screens/ConfigurationScreen';

// UI components
import ABlurView from '../components/UI/ALibrary/ABlurView';
import NavigationHeader from '../components/UI/NavigationHeader';

const Stack = createNativeStackNavigator();
const TransactionStack = createNativeStackNavigator();
const ModalStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  navigatorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navigator: {
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    elevation: 30,
  },
  xFillLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 0,
  },
  container: {
    position: 'relative',
    width: 45,
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
  },
});

function TabBarPrimaryButton() {
  const navigation = useNavigation();

  return (
    <Box style={styles.container} pointerEvents="box-none">
      <IconButton
        _icon={{
          as: AntDesign,
          name: 'plus',
        }}
        onPress={() => navigation.dispatch(
          CommonActions.navigate({
            name: 'TransactionCreateScreen',
          }),
        )}
        _pressed={{
          style: {
            top: -5,
          },
        }}
        style={{
          top: -5,
        }}
        testID="navigation_create_transaction"
      />
    </Box>
  );
}

function TabBarComponent({
  state,
  descriptors,
  navigation,
  insets,
}) {
  return (
    <>
      <ABlurView
        style={{
          ...styles.navigatorContainer,
          borderTopWidth: 0.5,
        }}
      >
        <BottomTabBar
          state={state}
          descriptors={descriptors}
          navigation={navigation}
          insets={insets}
        />
      </ABlurView>
      <NavigationHeader navigation={navigation} />
    </>
  );
}

function TabBarChartScreenIcon({ color }) {
  return (
    <AntDesign
      name="linechart"
      size={20}
      color={color}
    />
  );
}

function TabBarHomeScreenIcon({ color }) {
  return (
    <Foundation
      name="home"
      size={24}
      color={color}
    />
  );
}

function TabBarTransactionScreenIcon({ color }) {
  return (
    <AntDesign
      name="bars"
      size={25}
      color={color}
    />
  );
}

function TabBarConfigurationScreenIcon({ color }) {
  return (
    <AntDesign
      name="setting"
      size={22}
      color={color}
    />
  );
}

function headerRightComp() {
  const navigation = useNavigation();

  return (
    <IconButton
      variant="ghost"
      _icon={{
        as: FontAwesome,
        name: 'angle-down',
        paddingLeft: 1,
      }}
      onPress={navigation.goBack}
    />
  );
}

function TransactionsStack() {
  const { colors } = useThemeColors();

  return (
    <TransactionStack.Navigator initialRouteName="TransactionsScreen">
      <TransactionStack.Screen
        name="TransactionsScreen"
        component={TransactionsScreen}
        initialParams={{ forceRefresh: false }}
        options={{
          headerShown: true,
          header: NavigationHeader,
        }}
      />
      <TransactionStack.Screen
        name="TransactionDetailScreen"
        component={TransactionDetailScreen}
        options={{
          headerShown: true,
          headerTitle: '',
          headerBackTitleVisible: true,
          headerBackTitle: 'Back',
          headerBackTitleStyle: {
            fontFamily: 'Montserrat_Bold',
          },
          headerTransparent: Platform.select({ ios: true, android: false }),
          headerBlurEffect: Platform.select({ ios: 'regular' }),
          headerTintColor: colors.text,
          headerShadowVisible: true,
          headerStyle: {
            backgroundColor: Platform.select({ ios: 'transparent', android: colors.tileBackgroundColor }),
          },
          animation: Platform.select({ ios: 'default', android: 'slide_from_right' }),
        }}
      />
    </TransactionStack.Navigator>
  );
}

function PrimaryButtonComponent() {
  return <View />;
}

function Home() {
  const { colors } = useThemeColors();

  return (
    <Tab.Navigator
      tabBar={TabBarComponent}
      screenOptions={() => ({
        tabBarInactiveBackgroundColor: colors.tabBackgroundColor,
        tabBarActiveBackgroundColor: colors.tabBackgroundColor,
        tabBarActiveTintColor: colors.brandStyle,
        tabBarInactiveTintColor: colors.tabInactiveDarkLight,
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLazyLoad: true,
        tabBarStyle: {
          backgroundColor: Platform.select({ ios: 'transparent', android: colors.tileBackgroundColor }),
          borderTopWidth: 0,
          marginTop: 10,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Montserrat',
          paddingBottom: 10,
        },
      })}
    >
      <Tab.Screen
        name={translate('navigation_home_tab')}
        component={HomeScreen}
        options={{
          tabBarIcon: TabBarHomeScreenIcon,
          tabBarTestID: 'navigation_home_tab',
        }}
      />
      <Tab.Screen
        name={translate('navigation_chart_tab')}
        component={ChartScreen}
        options={{
          tabBarIcon: TabBarChartScreenIcon,
          tabBarTestID: 'navigation_chart_tab',
        }}
      />
      <Tab.Screen
        name="TransactionCreateBtn"
        component={PrimaryButtonComponent}
        options={{
          tabBarButton: TabBarPrimaryButton,
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsStack}
        options={{
          tabBarIcon: TabBarTransactionScreenIcon,
          title: translate('navigation_transactions_tab'),
          tabBarTestID: 'navigation_transactions_tab',
        }}
      />
      <Tab.Screen
        name={translate('navigation_settings_tab')}
        component={ConfigurationScreen}
        options={{
          tabBarIcon: TabBarConfigurationScreenIcon,
          tabBarTestID: 'navigation_settings_tab',
        }}
      />
    </Tab.Navigator>
  );
}

export default function Index() {
  const { colors } = useThemeColors();

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.backgroundColor,
        },
      }}
    >
      <Stack.Navigator
        initialRouteName="oauth"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="oauth"
          component={OauthScreen}
        />
        <Stack.Screen
          name="dashboard"
          component={Home}
        />
        <ModalStack.Group
          screenOptions={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        >
          <ModalStack.Screen
            name="TransactionCreateScreen"
            component={TransactionCreateScreen}
            options={{
              headerShown: true,
              headerBackVisible: false,
              headerTitle: translate('transaction_screen_title'),
              headerRight: headerRightComp,
              headerShadowVisible: true,
              headerTitleStyle: {
                fontFamily: 'Montserrat_Bold',
              },
              headerTintColor: colors.text,
              headerStyle: {
                backgroundColor: colors.tileBackgroundColor,
              },
            }}
          />
          <ModalStack.Screen
            name="FiltersScreen"
            component={FiltersScreen}
            options={{
              headerShown: true,
              headerBackVisible: false,
              headerTitle: 'Filters',
              headerRight: headerRightComp,
              headerShadowVisible: true,
              headerTitleStyle: {
                fontFamily: 'Montserrat_Bold',
              },
              headerTintColor: colors.text,
              headerStyle: {
                backgroundColor: colors.tileBackgroundColor,
              },
            }}
          />
        </ModalStack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
