import React from 'react';
import { ActivityIndicator, StyleSheet, Button, View, Text, Image, Alert, FlatList, StatusBar} from 'react-native';
import { createAppContainer, createStackNavigator } from 'react-navigation'; // Version can be specified in package.json
import { SearchBar, ListItem } from 'react-native-elements';
import { Font } from 'expo';
import Images from './assets/images/index';



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
                     source={Images.logo}
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
            <Text style={{color: '#092276'}}> </Text>
        </View>

            );
        }
    }
}

class DetailsScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            holder: [
                {IP: '192.168.43.6', name: 'LIGHT BULB 1', stat: true, img: Images.lightOn},
                {IP: '192.168.43.5', name: 'LIGHT BULB 2', stat: false, img: Images.lightOff}
            ],

        };

    }

    componentDidMount() {
        this.setState({
            data: this.state.holder,
        });


    }

    renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: '86%',
                    key: '',
                    backgroundColor: '#CED0CE',
                    marginLeft: '14%',
                }}
            />
        );
    };

    searchFilterFunction = text => {
        this.setState({
            value: text,
        });
        const newData = this.state.holder.filter(item => {
            const itemData = `${item.name.toUpperCase()}`;
            const textData = text.toUpperCase();

            return itemData.indexOf(textData) > -1;
        });
        this.setState({
            data: newData,
        });

    };

    renderHeader = () => {
        return (
            <SearchBar
                topPadding
                placeholder="Type Here..."
                lightTheme
                round
                onChangeText={text => this.searchFilterFunction(text)}
                autoCorrect={false}
                value={this.state.value}
            />

        );
    };


    render() {
        if (this.state.loading) {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                </View>
            );
        }
        return (

            <View style={{ flex: 1, flexDirection: 'column',  backgroundColor: '#092276', }}>
                <Text style={{opacity: 0, fontSize: 40}}> filler </Text>
                <FlatList
                    data={this.state.data}
                    renderItem={({ item }) => (
                        <ListItem
                            leftAvatar={{source: item.img}}
                            title={`${item.name}`}
                            subtitle={item.IP}
                            switch = {{
                                style:{marginTop:30},
                                onValueChange: value => {
                                    var i = this.state.data.findIndex(e => e.name == item.name);
                                    if(value) {
                                        var x =
                                            {
                                                IP: item.IP,
                                                name: item.name,
                                                stat: value,
                                                img: Images.lightOn,
                                            };
                                        console.log(item.name + ' is turning ' + value);
                                        this.state.data[i] = x;
                                        this.setState({data: this.state.data, holder: this.state.holder});
                                        item.stat = this.state.data[i].stat;
                                        console.log('http://' + item.IP);
                                        return fetch('http://' + item.IP, {
                                            method: 'GET',
                                            headers: {
                                                Accept: '/turn/on',
                                            },
                                        })
                                            .then((response) => {
                                                return response.text();
                                            })
                                            .then((responseJson) => {
                                                const x = responseJson;
                                                if (x.indexOf("Already_On") >= 0) {
                                                    Alert.alert(
                                                        'Already On!',
                                                        'Light switch is already on!',
                                                        [
                                                            {text: 'Ok', onPress: () => console.log('Ok')},
                                                            {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                                                            {text: 'Bruh', onPress: () => console.log('Bruh')},
                                                        ],
                                                        {cancelable: true}
                                                    )
                                                    console.log("TURN: ON AGAIN");
                                                } else if (x.indexOf("On_Success!") >= 0) {
                                                    Alert.alert(
                                                        'Success!',
                                                        'Light switch turned on!',
                                                        [
                                                            {text: 'Ok', onPress: () => console.log('Ok')},
                                                            {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                                                            {text: 'Bruh', onPress: () => console.log('Bruh')},
                                                        ],
                                                        {cancelable: true}
                                                    )
                                                    console.log("TURN: ON");
                                                }
                                            })
                                            .catch((error) => {
                                                Alert.alert(
                                                    'Failed!',
                                                    'Light switch was not turned on due to an error, see console.',
                                                    [
                                                        {text: 'Ok', onPress: () => console.log('Ok')},
                                                        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                                                        {text: 'Bruh', onPress: () => console.log('Bruh')},
                                                    ],
                                                    {cancelable: true}
                                                )
                                                console.log("TURN: ERROR!!!");
                                                console.error(error);
                                            });
                                    }
                                    else{
                                        console.log(item.name + ' is turning ' + value);
                                        var x =
                                            {
                                                IP: item.IP,
                                                name: item.name,
                                                stat: value,
                                                img: Images.lightOff,
                                            };
                                        this.state.data[i] = x;
                                        this.setState({data: this.state.data, holder: this.state.holder});
                                        item.stat = this.state.data[i].stat;
                                        console.log('http://' + item.IP);
                                        return fetch('http://' + item.IP, {
                                            method: 'GET',
                                            headers: {
                                                Accept: '/turn/off',
                                            },
                                        })
                                            .then((response) => {
                                                return response.text();
                                            })
                                            .then((responseJson) => {
                                                const x = responseJson;
                                                console.log(x);
                                                if (x.indexOf("Already_off") >= 0) {
                                                    Alert.alert(
                                                        'Already off!',
                                                        'Light switch is already off!',
                                                        [
                                                            {text: 'Ok', offPress: () => console.log('Ok')},
                                                            {text: 'Cancel', offPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                                                            {text: 'Bruh', offPress: () => console.log('Bruh')},
                                                        ],
                                                        {cancelable: true}
                                                    )
                                                    console.log("TURN: off AGAIN");
                                                } else if (x.indexOf("off_Success!") >= 0) {
                                                    Alert.alert(
                                                        'Success!',
                                                        'Light switch turned off!',
                                                        [
                                                            {text: 'Ok', offPress: () => console.log('Ok')},
                                                            {text: 'Cancel', offPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                                                            {text: 'Bruh', offPress: () => console.log('Bruh')},
                                                        ],
                                                        {cancelable: true}
                                                    )
                                                    console.log("TURN: off");
                                                }
                                            })
                                            .catch((error) => {
                                                Alert.alert(
                                                    'Failed!',
                                                    'Light switch was not turned off due to an error, see console.',
                                                    [
                                                        {text: 'Ok', offPress: () => console.log('Ok')},
                                                        {text: 'Cancel', offPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                                                        {text: 'Bruh', offPress: () => console.log('Bruh')},
                                                    ],
                                                    {cancelable: true}
                                                )
                                                console.log("TURN: ERROR!!!");
                                                console.error(error);
                                            });

                                    }
                                },
                                value: item.stat,
                            }
                            }
                        />

                        )}
                    extraData = {this.state}
                    keyExtractor={item => item.IP}
                    ItemSeparatorComponent={this.renderSeparator}
                    ListHeaderComponent={this.renderHeader}
                />
            </View>
        );
    }
}


const RootStack = createStackNavigator(
    {
      Home: {
        screen: HomeScreen,
        navigationOptions: {header: null},
      },
      Details: {
          screen: DetailsScreen,
          navigationOptions: {header: null},
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