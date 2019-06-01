import React from 'react';
import {StyleSheet, Button, View, Text, Image, Alert, FlatList, TouchableOpacity} from 'react-native';
import {SearchBar, ListItem} from 'react-native-elements';
import {Font} from 'expo';
import Images from './assets/images/index';
import Swiper from 'react-native-swiper';
import {AsyncStorage} from 'react-native';
import t from 'tcomb-form-native';

const Form = t.form.Form;

const LightbulbStruc = t.struct({
    IP: t.String,
    name: t.String,
    stat: false,
    img: Images.lightOff,
});

const formStyles = {
    ...Form.stylesheet,
    formGroup: {
        normal: {
            marginBottom: 10
        },
    },
    controlLabel: {
        normal: {
            color: 'blue',
            fontSize: 18,
            marginBottom: 7,
            fontWeight: '600'
        },
        // the style applied when a validation error occours
        error: {
            color: 'red',
            fontSize: 18,
            marginBottom: 7,
            fontWeight: '600'
        }
    }
}

const creation = {
    fields: {
        name: {
            error: 'You need a name for the lightbulb.'
        },
        IP: {
            error: 'Input the IP adress of the flipper.'
        },
    },
    stylesheet: formStyles,
};

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fontLoaded: false, // Will be set to true after loading
            data: [], // To store viewable light bulbs
            holder: [ // To hold all light bulbs
                {IP: '192.168.43.6', name: 'LIGHT BULB 1', stat: true, img: Images.lightOn},
            ],
            after: true //After first swipe

        };
    }

    async componentDidMount() { // First thing that runs
        await Font.loadAsync({ // Loads font
            'LemonMilk': require('./assets/fonts/LemonMilk.otf'),
        });

        try{
            AsyncStorage.clear();
        }catch(error){}

        await this.updateLights();

        this.setState({
            data: this.state.holder, fontLoaded: true
        });


        console.log(this.state);
        console.log('successfully loaded');
    }


    async updateLights() {
        try {
            const value = await AsyncStorage.getItem('LIGHTBULBS');
            if (value !== null) {
                this.setState({holder: [...this.state.holder, ...JSON.parse(value)]});
            }
        } catch (error) {
            console.log(error);
        }
    }

    handleSubmit = () => {
        const value = this._form.getValue();
        console.log('value: ', value);
    };

    renderSeparator = () => {
        return (
            <View
                style={{
                    key: '',
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
            <View>
                <SearchBar
                    topPadding
                    placeholder="Search..."
                    lightTheme
                    containerStyle={{
                        backgroundColor: '#092276',
                        borderColor: '#000',
                        borderBottomWidth: 0,
                        borderTopWidth: 0
                    }}
                    onChangeText={text => this.searchFilterFunction(text)}
                    autoCorrect={false}
                    value={this.state.value}
                />

                <TouchableOpacity
                    style={{backgroundColor: '#092276', alignItems: 'center'}}
                    onPress={() => {
                        this.refs.swiper.scrollBy(1)
                    }
                    }>
                    <Text style={{fontSize: 20, color: '#FFF'}}>+ +</Text>
                </TouchableOpacity>
            </View>

        );
    };

    render() {

        if (!this.state.fontLoaded) {
            return (
                <View style={styles.homeScreen1}>
                    <Text style={{color: '#092276'}}> </Text>
                </View>);
        } else {
            return (
                <Swiper loop={false}
                        showsPagination={false}
                        scrollEnabled = {this.state.after}
                        onIndexChanged = {() => {
                            this.setState({after : false})
                        }}
                        ref = 'swiper'
                >
                    <View style={styles.homeScreen1}>
                        <Image
                            style={{width: 400, height: 400}}
                            source={Images.logo}
                        />
                        <Text style={styles.baseText}> >>> </Text>
                    </View>
                    <View style={{flex: 1, flexDirection: 'column', backgroundColor: '#092276'}}>
                        <Text style={{opacity: 0, fontSize: 45}}> filler </Text>
                        <FlatList
                            style={{backgroundColor: '#FFFFFF'}}
                            data={this.state.data}
                            renderItem={({item}) => (
                                <ListItem
                                    style={{backgroundColor: '#092276'}}
                                    leftAvatar={{source: item.img}}
                                    title={`${item.name}`}
                                    subtitle={item.IP}
                                    switch={{
                                        thumbColor: item.stat == false ? '#092276' : '#F8E486',
                                        onValueChange: value => {
                                            var i = this.state.data.findIndex(e => e.name == item.name);
                                            if (value) {
                                                var x =
                                                    {
                                                        IP: item.IP,
                                                        name: item.name,
                                                        stat: value,
                                                        img: Images.lightOn,
                                                    };
                                                console.log(item.name + ' is turning ' + value);
                                                this.state.data[i] = x;
                                                this.setState({
                                                    fontLoaded: true,
                                                    data: this.state.data,
                                                    holder: this.state.holder
                                                });
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
                                                        console.log('RESPONSE:' + x);
                                                        if (x.indexOf("Already_On") >= 0) {
                                                            console.log("TURN: ON AGAIN");
                                                        } else if (x.indexOf("On_Success!") >= 0) {
                                                            console.log("TURN: ON");
                                                        }
                                                    })
                                                    .catch((error) => {
                                                        Alert.alert(
                                                            'Failed!',
                                                            'Light switch was not turned on due to an error, see console.',
                                                            [
                                                                {text: 'Ok', onPress: () => console.log('Ok')},
                                                                {
                                                                    text: 'Cancel',
                                                                    onPress: () => console.log('Cancel Pressed'),
                                                                    style: 'cancel'
                                                                },
                                                                {text: 'Bruh', onPress: () => console.log('Bruh')},
                                                            ],
                                                            {cancelable: true}
                                                        )
                                                        console.log("TURN: ERROR!!!");
                                                        console.error(error);
                                                    });
                                            } else {
                                                console.log(item.name + ' is turning ' + value);
                                                var x =
                                                    {
                                                        IP: item.IP,
                                                        name: item.name,
                                                        stat: value,
                                                        img: Images.lightOff,
                                                    };
                                                this.state.data[i] = x;
                                                this.setState({
                                                    fontLoaded: true,
                                                    data: this.state.data,
                                                    holder: this.state.holder
                                                });
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
                                                        console.log('RESPONSE:' + x);
                                                        if (x.indexOf("Already_Off") >= 0) {
                                                            console.log("TURN: off AGAIN");
                                                        } else if (x.indexOf("Off_Success!") >= 0) {
                                                            console.log("TURN: off");
                                                        }
                                                    })
                                                    .catch((error) => {
                                                        Alert.alert(
                                                            'Failed!',
                                                            'Light switch was not turned off due to an error, see console.',
                                                            [
                                                                {text: 'Ok', offPress: () => console.log('Ok')},
                                                                {
                                                                    text: 'Cancel',
                                                                    offPress: () => console.log('Cancel Pressed'),
                                                                    style: 'cancel'
                                                                },
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
                            extraData={this.state}
                            keyExtractor={item => item.IP}
                            ItemSeparatorComponent={this.renderSeparator}
                            ListHeaderComponent={this.renderHeader}
                        />
                    </View>
                    <View>
                        <Form
                            ref={c => this._form = c}
                            type={User}
                            options={options}
                        />
                        <Button
                            title="Sign Up!"
                            onPress={this.handleSubmit}
                        />
                    </View>
                </Swiper>);
        }

    }
}

const styles = StyleSheet.create({
    homeScreen1: {
        flex: 1,
        backgroundColor: '#092276',
        alignItems: 'center',
        justifyContent: 'center',
    },

    baseText: {
        fontFamily: 'LemonMilk',
        marginTop: 40,
        fontSize: 40,
        marginBottom: 10,
        color: 'white',
    },
});

