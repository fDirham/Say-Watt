import React from 'react';
import { StyleSheet, Button, View, Text, Image } from 'react-native';
import { createAppContainer, createStackNavigator } from 'react-navigation'; // Version can be specified in package.json
import { Font } from 'expo';

class HomeScreen extends React.Component {
    state = {
        fontLoaded: false,
    };

    async componentDidMount() {
        await Font.loadAsync({
            'LemonMilk': require('./assets/fonts/LemonMilk.otf'),
        });

        this.setState({ fontLoaded: true });
        console.log('mounted!');
    }

    render() {
        if(this.state.fontLoaded){
         return (
             <View style={styles.homeScreen1}>
                 <Image
                     style={{width: 400, height: 400}}
                     source={require('./assets/images/LOGO_2.jpg')}
                 />
                 <Text style={styles.baseText}>Looking Glass</Text>
                 <Button
                     title="Go to Details"
                     onPress={() => this.props.navigation.navigate('Details')}
                 />
             </View>
         );
        } else {
            return(
                <View style={styles.homeScreen1}>
                <Image
            style={{width: 400, height: 400}}
            source={require('./assets/images/LOGO_2.jpg')}
            />
            <Text style={{color: '#092276'}}> </Text>
                    <Text style={{color: '#092276'}}> </Text>
        </View>

            );
        }
    }
}

class DetailsScreen extends React.Component {
  render() {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Details Screen</Text>
          <Button
              title="Go to Details... again"
              onPress={() => this.props.navigation.push('Details')}
          />
          <Button
              title="Go to Home"
              onPress={() => this.props.navigation.navigate('Home')}
          />
          <Button
              title="Go back"
              onPress={() => this.props.navigation.goBack()}
          />
        </View>
    );
  }
}

const RootStack = createStackNavigator(
    {
      Home: {
        screen: HomeScreen,
      },
      Details: {
        screen: DetailsScreen,
      },
    },
    {
      initialRouteName: 'Home',
    }
);

const AppContainer = createAppContainer(RootStack);

const styles = StyleSheet.create({
  homeScreen1: {
    flex: 1,
    backgroundColor: '#092276',
    alignItems: 'center',
    justifyContent: 'center',
  },

  baseText: {
    fontFamily: 'LemonMilk',
    marginTop:40,
    fontSize: 40,
    marginBottom: 10,
    color: 'white',
  },
});

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}