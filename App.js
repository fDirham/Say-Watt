import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    Alert,
    FlatList,
    TouchableOpacity,
    Switch,
    Dimensions,
    Platform
} from 'react-native'; // React-native components
import {SearchBar, ListItem} from 'react-native-elements'; // For the search bar and list view
import {Font} from 'expo'; // For importing custom fonts
import Images from './assets/images/index'; // Imports custom images
import Swiper from 'react-native-swiper'; // For navigation and style purposes
import {AsyncStorage} from 'react-native'; // For local data storage
import t from 'tcomb-form-native'; // For form creations

// Constants
// -Dimensions of screen, used for element scaling
const {height, width} = Dimensions.get('window');

// -Signature colors
const ourBlue = '#092276';
const ourYellow = '#F8E486';

// -Toggle object that is always added to the list no matter what, can be removed if you want, mainly for demo
const firstLight = [{
    IP: '192.168.43.6',
    name: 'LIGHT BULB 1',
    stat: false,
    img: Images.lightOff
}];

// -Form constants, cannot be separated from this file!
const Form = t.form.Form; // Form template
const ToggleStruc = t.struct({ //Defines what is asked in the form
    name: t.String,
    IP: t.String,
});
const formStyles = { //Form styling
    ...Form.stylesheet,
    formGroup: {
        normal: {
            marginBottom: 10
        },
    },
    controlLabel: {
        normal: {
            left: 10,
            fontFamily: 'AEH',
            color: '#000',
            fontSize: 20,
            marginBottom: 7,
        },
        // Defines the style applied when a validation error occurs
        error: {
            fontFamily: 'AEH',
            left: 10,
            color: ourYellow,
            fontSize: 20,
            marginBottom: 7,
        }
    },
    textbox: {
        normal: {
            color: '#000',
            fontSize: 16,
            fontFamily: 'AEH',
            height: 26,
            paddingVertical: Platform.OS === "ios" ? 7 : 0,
            paddingHorizontal: 7,
            borderRadius: 0,
            borderWidth: 0,
            borderColor: '#000',
            borderBottomWidth: 1,
            left: 10,
            width: width * 0.9,
            marginBottom: 5
        },
        error: {
            color: '#000',
            fontSize: 16,
            fontFamily: 'AEH',
            height: 26,
            paddingVertical: Platform.OS === "ios" ? 7 : 0,
            paddingHorizontal: 7,
            borderRadius: 0,
            borderWidth: 0,
            borderColor: '#000',
            borderBottomWidth: 1,
            left: 10,
            width: width * 0.9,
            marginBottom: 5
        },
    }
};
const creation = { // Form creation constant, specifies that both fields are crucial and gives errors when not filled
    fields: {
        name: {
            error: 'You need a name for the toggle.'
        },
        IP: {
            error: 'Input the IP address of the toggle.'
        },
    },
    stylesheet: formStyles,
};

export default class App extends React.Component {
    // The constructor initializes or the state elements that are saved and used for a variety of things in the app
    constructor(props) {
        super(props);
        this.state = {
            loading: true, // Will be set to true after loading, to ensure font is loaded
            data: [], // Which toggles user can see
            holder: [], // To hold all toggles saved
            firstTime: true, //Set to false after first time, to see if app should so tutorial
            where: 0 // Tells app where user is, 0 -> landing, 1 -> tutorial, 2 -> main app
        };
    }

    async componentDidMount() { // First thing that runs when app loads, always runs. Made async for await
        await Font.loadAsync({ // Loads font
            'AEH': require('./assets/fonts/AEH.ttf'),
        });

        // Code reads all the toggles that are saved in the device
        try {
            const saved = await AsyncStorage.getItem("ToggleData");
            if (saved == null) {
                // If firstLight not being used, change to empty array, []
                await AsyncStorage.setItem("ToggleData", JSON.stringify(firstLight));
            } else { //  Converts all the saved data, which is in string, to a JSON array
                const savedJSON = JSON.parse(saved);
                // Finds if firstLight already in data
                const indexFirstLight = savedJSON.findIndex(e => e.name == 'LIGHT BULB 1');
                if (indexFirstLight == -1) { // Adds firstLight if it isn't in the data
                    const startSaved = [...firstLight, ...savedJSON];
                    await AsyncStorage.setItem("ToggleData", JSON.stringify(startSaved));
                }
            }
        } catch (error) {
            console.log(error)
        }

        try { // Checks if the user is using the app for the first time
            const saved = await AsyncStorage.getItem("history");
            if (saved == null) {
                await AsyncStorage.setItem("history", 'new');
                this.setState({firstTime: true});
            } else if (saved == 'new') {
                this.setState({firstTime: true});
            } else {
                this.setState({firstTime: false});
            }
        } catch (error) {
            console.log(error)
        }

        try { // Retrieves all saved toggles and updates arrays in app accordingly
            const value = await AsyncStorage.getItem('ToggleData');
            if (value != null) {
                this.setState({holder: [...this.state.holder, ...JSON.parse(value)]});
            }
        } catch (error) {
            console.log(error);
        }

        // Sets state.data to state.holder for initial look of app without anything searched in
        this.setState({
            data: this.state.holder, loading: false // Since we used await, if code gets here then everything loaded
        });

        console.log('successfully loaded');
    }

    // FlatList methods
    searchFilterFunction = text => { // Function takes care of the search bar and its functionality
        this.setState({
            value: text,
        });
        const newData = this.state.holder.filter(item => { // Compare's what is typed in with...
            const itemData = `${item.name.toUpperCase()}`; // ...Light bulb's name
            const textData = text.toUpperCase(); // Capitalizes for comparison

            return itemData.indexOf(textData) > -1; // If anything matches...
        });
        this.setState({
            data: newData, // ...puts list in state.data so it is shown
        });

    };
    renderSeparator = () => { // Renders what separates elements in the flat list
        return (
            <View
                style={{
                    key: '',
                }}
            />
        );
    };
    renderHeader = () => { // Renders the header, which contains search bar
        return (
            <View>
                <SearchBar // Search bar component, styled out
                    topPadding
                    placeholder="Search..."
                    lightTheme
                    containerStyle={{
                        backgroundColor: ourBlue,
                        borderColor: '#000',
                        borderBottomWidth: 0,
                        borderTopWidth: 0,
                        width: width,
                        height: height / 10
                    }}
                    onChangeText={text => this.searchFilterFunction(text)} // Listens for text changes
                    autoCorrect={false} // No auto correct
                    value={this.state.value}
                />

                <View style={{ // Contains buttons for 'help' and 'add'.
                    flexDirection: 'row',
                    height: height / 20,
                    backgroundColor: ourBlue,
                    justifyContent: 'space-between' // Puts buttons on opposite ends of screen
                }}>

                    <TouchableOpacity // A touchable opacity is like a button but more flexible, this one is for 'help'
                        style={{backgroundColor: ourBlue, align: ''}}
                        onPress={this.toHelp}
                    >
                        <Text style={{
                            fontFamily: 'AEH',
                            fontSize: 20,
                            color: '#FFF',
                            textAlign: 'right' // Change 'Help' below to change text of button
                        }}> Help </Text>
                    </TouchableOpacity>

                    <TouchableOpacity // For add
                        style={{backgroundColor: ourBlue}}
                        onPress={() => {
                            this.refs.swiper.scrollBy(1) // Redirects to scroll screen
                        }
                        }>
                        <Text style={{
                            fontFamily: 'AEH',
                            fontSize: 20,
                            color: '#FFF',
                            textAlign: 'right'
                        }}> Add </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };
    // Runs when a help button is pushed
    toHelp = () => {
        Alert.alert( // Asks if user really needs help
            'Need Help?',
            'You will be redirected to the tutorial section',
            [
                {
                    text: 'Take me there',
                    onPress: () => {
                        this.setState({where: 1}) // Redirects to tutorial
                    }
                },
                {
                    text: 'Reset to first time state (FOR DEMO)', // For demo, resets everything, all saved data
                    onPress: async () => {
                        try {
                            await AsyncStorage.clear();
                            await AsyncStorage.setItem("ToggleData", JSON.stringify(firstLight));
                        } catch (error) {
                            console.log(error)
                        }
                        this.setState({
                            loading: false, // If set to true, app never loads
                            data: firstLight,
                            holder: firstLight,
                            firstTime: true,
                            where: 0
                        })
                    }
                },
                {
                    text: 'Cancel',
                    onPress: () => console.log('Backed out of help'),
                    style: 'cancel'
                },
            ],)
    };


    // Form methods
    handleSubmit = async () => { // Runs when the submit button in the form is pushed
        const value = this._form.getValue(); // Takes values from the struct created by submitting form
        if (value != null) {
            var togglePrototype = { // Creates the object that will get added
                IP: value.IP,
                name: value.name,
                stat: false,
                img: Images.lightOff
            };
            try {// Standard taking out saved data, checking if null, and saving and refreshing the state
                const value = await AsyncStorage.getItem('ToggleData');
                if (value != null) {
                    const valueArray = JSON.parse(value);
                    const newValArray = [...valueArray, togglePrototype];
                    await AsyncStorage.setItem('ToggleData', JSON.stringify(newValArray));
                    this.setState({holder: newValArray, data: newValArray});
                } else {
                    await AsyncStorage.setItem('ToggleData', JSON.stringify([togglePrototype]));
                    this.setState({holder: [togglePrototype], data: [togglePrototype]});
                }
            } catch (error) {
                console.log(error);
            }
            this.refs.swiper.scrollBy(-1); //Scrolls back to first page
        }
    };
    handleCancel = async () => { // Runs when cancel is pressed, could put inside but neater this way
        await this.refs.swiper.scrollBy(-1);
    };


    // This is where everything gets rendered and put together
    render() {
        // Screen for loading, just put bare minimums here
        if (this.state.loading) {
            return (
                <View style={styles.homeScreen1}>
                    <Text style={{
                        opacity: 0
                    }}>...</Text>
                </View>
            )
        } else {
            if (this.state.where == 0) { //Home screen
                return (
                    <View style={styles.homeScreen1}>
                        <Image //Main logo for landing page, this is how images are loaded in
                            style={{width: width * 0.6, height: height * 0.6}}
                            source={Images.logo}
                        />
                        <Switch // Once switch is turned, move to page depending on state.firstTime
                            onValueChange={() => {
                                if (this.state.firstTime) {
                                    this.setState({where: 1})
                                } else {
                                    this.setState({where: 2})
                                }
                            }}
                            value={false}
                        />
                    </View>
                )
            }
            if (this.state.where == 1) { //Tutorial sections
                return (
                    <Swiper // Makes pages navigable through swiping
                        loop={false} // Disables infinite scrolling
                        showsPagination={true} // Shows buttons at bottom
                        scrollEnabled={true} // Enables scrolling
                    >
                        <View style={styles.tutorialScreens}>
                            <View style={{ // Page 1 of tutorial
                                alignItems: 'center'
                            }}>
                                <Image // Image 1
                                    style={{width: height / 3, height: height / 3}}
                                    source={Images.tut1}
                                />
                                <Text style={styles.tutorialText1}>STEP 1</Text>
                            </View>
                            <Text style={styles.tutorialText2}>Install your SayWatt Toggle Device on a light switch of
                                your choosing. Turn it on.</Text>
                        </View>

                        <View style={styles.tutorialScreens}>
                            <View style={{ // Page 2 of tutorial
                                alignItems: 'center'
                            }}>
                                <Image // Image 2
                                    style={{width: height / 3, height: height / 3}}
                                    source={Images.tut2}
                                />
                                <Text style={styles.tutorialText1}>STEP 2</Text>
                            </View>
                            <Text style={styles.tutorialText2}>Connect to your SayWatt Toggle Device's wifi. Usually
                                named: 'SW TOGGLE DEVICE X'.</Text>
                        </View>

                        <View style={styles.tutorialScreens}>
                            <View style={{ // Page 3
                                alignItems: 'center'
                            }}>
                                <Image // Image 3
                                    style={{width: height / 3, height: height / 3}}
                                    source={Images.tut3}
                                />
                                <Text style={styles.tutorialText1}>STEP 3</Text>
                            </View>
                            <Text style={styles.tutorialText2}>Through the device's wifi portal, connect to your home
                                WiFi. Keep note of the IP address.</Text>
                        </View>

                        <View style={styles.tutorialScreens}>
                            <View style={{ // Page 4
                                alignItems: 'center'
                            }}>
                                <Image
                                    style={{width: height / 3, height: height / 3}}
                                    source={Images.tut4}
                                />
                                <Text style={styles.tutorialText1}>STEP 4</Text>
                            </View>
                            <Text style={styles.tutorialText2}>Use the add button to register your SayWatt Toggle
                                Device, creating a toggle object.</Text>
                        </View>

                        <View style={styles.tutorialScreens}>
                            <View style={{ // Page 5
                                alignItems: 'center'
                            }}>
                                <Image
                                    style={{width: height / 3, height: height / 3}}
                                    source={Images.tut5}
                                />
                                <Text style={styles.tutorialText1}>STEP 5</Text>
                            </View>
                            <Text style={styles.tutorialText2}>Use the switches on the toggle object's right to turn
                                device on and off. Make sure you are connected to the same WiFi as your Toggle
                                Device.</Text>
                        </View>

                        <View style={styles.tutorialScreens}>
                            <View style={{ // Page 6
                                alignItems: 'center'
                            }}>
                                <Image
                                    style={{width: height / 3, height: height / 3}}
                                    source={Images.tut6}
                                />
                                <Text style={styles.tutorialText1}>STEP 6</Text>
                            </View>
                            <Text style={styles.tutorialText2}>Delete a toggle object by holding down on the toggle
                                object.</Text>
                        </View>

                        <View style={styles.tutorialScreens}>
                            <View style={{ // Final page
                                alignItems: 'center'
                            }}>
                                <Image
                                    style={{width: height / 3, height: height / 3}}
                                    source={Images.tut7}
                                />
                                <Text style={styles.tutorialText1}>Enjoy :) -F.Y.D</Text>
                            </View>
                            <Switch
                                onValueChange={async () => {
                                    this.setState({where: 2})
                                }}
                                value={false}
                            />
                        </View>
                    </Swiper>
                )
            }

            if (this.state.where == 2) { // Main app
                return (
                    <Swiper
                        showsPagination={false}
                        scrollEnabled={false}
                        ref='swiper' // For navigation methods, reference name needed
                        index={0} // Starting page for swiper
                    >
                        <View
                            style={{flex: 1, flexDirection: 'column', backgroundColor: ourBlue}}
                            onLayout={async () => {
                                await AsyncStorage.setItem("history", 'old');
                            }} // If users get here, they are no longer considered a first time user
                            // If you see the 'style' component below, it is being used to align things between the two
                            // screens in the app. They are used all over the app
                        >
                            <View style={{width: width, height: height / 20, backgroundColor: ourBlue}}/>
                            <FlatList // The FlatList component
                                style={{backgroundColor: '#FFFFFF'}}
                                data={this.state.data} // What to display, set to other arrays if you want
                                renderItem={({item}) => (
                                    <ListItem
                                        style={{backgroundColor: ourBlue}}
                                        leftAvatar={{source: item.img}} // Uses toggle images, showing on or off
                                        title={`${item.name}`} // Shows toggle name
                                        subtitle={item.IP} // Shows toggle IP address
                                        titleStyle={{fontFamily: 'AEH'}}
                                        subtitleStyle={{fontFamily: 'AEH'}}
                                        onLongPress={async () => { // Holding down on a toggle deletes it
                                            // Code cannot be separated due to needing to use 'item.name'
                                            Alert.alert( // Sends an alert to make sure
                                                'Delete Toggle?',
                                                'Are you sure you want to delete toggle ' + item.name,
                                                [
                                                    {
                                                        text: 'Yes', onPress: async () => {
                                                            // Essentially finds the toggle in the JSON data
                                                            const valString = await AsyncStorage.getItem('ToggleData');
                                                            const valueArray = JSON.parse(valString);
                                                            const index = valueArray.findIndex(e => e.name == item.name);
                                                            // Deletes the toggle from array
                                                            valueArray.splice(index, 1);
                                                            // Updates/refreshes the stored data and app
                                                            const newValArray = JSON.stringify(valueArray);
                                                            await AsyncStorage.setItem('ToggleData', newValArray);
                                                            this.setState({holder: valueArray});
                                                            this.setState({data: valueArray});
                                                        }
                                                    },
                                                    {
                                                        text: 'Cancel',
                                                        style: 'cancel'
                                                    },
                                                ],
                                                {cancelable: true} // If set to false, users can't back out
                                            );
                                        }}

                                        switch={{ // The switches that send fetch request on the right
                                            // Changes color of thumb depending on value
                                            thumbColor: item.stat == false ? ourBlue : ourYellow,
                                            onValueChange: async value => { // Method cannot be separated
                                                                            // due to needing item.values

                                                // Stores indexes of the value of toggle in both data and holder
                                                var i = this.state.data.findIndex(e => e.name == item.name);
                                                var j = this.state.holder.findIndex(e => e.name == item.name);
                                                if (value) { // If switch is turned on
                                                    // Change value in arrays
                                                    this.state.data[i] = this.state.holder[j] = {
                                                        IP: item.IP,
                                                        name: item.name,
                                                        stat: value,
                                                        img: Images.lightOn,
                                                    };

                                                    this.setState({ // Updates the arrays for good
                                                        data: this.state.data,
                                                        holder: this.state.holder
                                                    });

                                                    try { // Changes value in local data storage
                                                        const valString = JSON.stringify(this.state.holder);
                                                        await AsyncStorage.setItem('ToggleData', valString);
                                                    } catch (error) {
                                                        console.log(error)
                                                    }

                                                    // Send a fetch request to communicate with ISP
                                                    return fetch('http://' + item.IP, {
                                                        method: 'GET', // Requesting data from ESP
                                                        headers: {// If ESP does not receive these lines, it will not
                                                            //turn on
                                                            Accept: '/turn/on',
                                                        },
                                                    })
                                                    // Converts text response to readable text
                                                        .then((response) => {
                                                            return response.text();
                                                        })
                                                        // Can detect if light is already on or not
                                                        .then((responseText) => {
                                                            const x = responseText;
                                                            console.log('TURNING ' + item.name);
                                                            console.log('RESPONSE:' + x);
                                                            if (x.indexOf("Already_On") >= 0) {
                                                                console.log("TURN: ON AGAIN");
                                                            } else if (x.indexOf("On_Success!") >= 0) {
                                                                console.log("TURN: ON");
                                                            }
                                                        })
                                                        .catch(async (error) => { // Error handling
                                                            console.log("TURN: ERROR!!!");
                                                            console.log(error);
                                                            Alert.alert( // Sends alert to user
                                                                'Connection failed!',
                                                                'Failed to connect to ' +
                                                                item.name + '. Please check batteries and connection.',
                                                                [
                                                                    {text: 'Ok', onPress: () => console.log('Ok')},
                                                                ],
                                                                {cancelable: false});
                                                            // Reverting all the data back to original
                                                            this.state.data[i] = this.state.holder[j] = {
                                                                IP: item.IP,
                                                                name: item.name,
                                                                stat: !value,
                                                                img: Images.lightOff,
                                                            };
                                                            this.setState({
                                                                fontLoaded: true,
                                                                data: this.state.data,
                                                                holder: this.state.holder
                                                            });

                                                            try {
                                                                const valString = JSON.stringify(this.state.holder);
                                                                await AsyncStorage.setItem('ToggleData',);
                                                            } catch (error) {
                                                                console.log(error)
                                                            }
                                                        });
                                                } else { // If switch is turned off, identical code to above
                                                    this.state.data[i] = this.state.holder[j] = {
                                                        IP: item.IP,
                                                        name: item.name,
                                                        stat: value,
                                                        img: Images.lightOff,
                                                    };

                                                    this.setState({
                                                        data: this.state.data,
                                                        holder: this.state.holder
                                                    });

                                                    try {
                                                        const valArray = JSON.stringify(this.state.holder);
                                                        await AsyncStorage.setItem('ToggleData', valArray);
                                                    } catch (error) {
                                                        console.log(error)
                                                    }

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
                                                            console.log('TURNING ' + item.name);
                                                            console.log('RESPONSE:' + x);
                                                            if (x.indexOf("Already_Off") >= 0) {
                                                                console.log("TURN: ON AGAIN");
                                                            } else if (x.indexOf("On_Success!") >= 0) {
                                                                console.log("TURN: OFF");
                                                            }
                                                        })
                                                        .catch(async (error) => {
                                                            console.log("TURN: ERROR!!!");
                                                            console.log(error);
                                                            Alert.alert(
                                                                'Connection failed!',
                                                                'Failed to connect to ' +
                                                                item.name + '. Please check batteries and connection.',
                                                                [
                                                                    {text: 'Ok', onPress: () => console.log('Ok')},
                                                                ],
                                                                {cancelable: false});
                                                            this.state.data[i] = this.state.holder[j] = {
                                                                IP: item.IP,
                                                                name: item.name,
                                                                stat: !value,
                                                                img: Images.lightOn,
                                                            };
                                                            this.setState({
                                                                fontLoaded: true,
                                                                data: this.state.data,
                                                                holder: this.state.holder
                                                            });

                                                            try {
                                                                const valArray = JSON.stringify(this.state.holder);
                                                                await AsyncStorage.setItem('ToggleData', valArray);
                                                            } catch (error) {
                                                                console.log(error)
                                                            }
                                                        });
                                                }
                                            },
                                            value: item.stat,
                                        }
                                        }
                                    />

                                )}
                                extraData={this.state} // Refereshes list after operations
                                keyExtractor={item => item.IP} // Assigns keys to array elements used,
                                // useful to get react to stop sending error messages
                                ItemSeparatorComponent={this.renderSeparator} // Calls separator
                                ListHeaderComponent={this.renderHeader} // Calls header/searchbar + buttons

                                // Below is code for the Form / button addition
                            />
                        </View>
                        <View style={{
                            justifyContent: 'space-between',
                            flex: 1,
                            flexDirection: 'column',
                        }}>
                            <View>
                                <View style={{
                                    width: width,
                                    height: height / 5,
                                    backgroundColor: ourBlue,
                                    alignItems: 'center'
                                }}>
                                    <View style={{width: width, height: height / 20}}/>
                                    <Image // Logo at the top
                                        style={{width: height / 7, height: height / 7}}
                                        source={Images.logo}
                                    />
                                </View>
                                <View style={{width: width, height: height / 20}}/>
                                <Form
                                    ref={c => this._form = c} // Creates the form using constants defined earlier
                                    type={ToggleStruc}
                                    options={creation}
                                />
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                height: height / 25,
                                backgroundColor: ourBlue,
                                justifyContent: 'space-between'
                            }}>
                                <TouchableOpacity // Cancel button
                                    onPress={this.handleCancel}
                                    style={{backgroundColor: ourBlue}}>
                                    <Text style={{
                                        fontFamily: 'AEH',
                                        fontSize: 20,
                                        color: '#FFF',
                                        textAlign: 'right'
                                    }}> Cancel </Text>
                                </TouchableOpacity>

                                <TouchableOpacity // Submit button
                                    onPress={this.handleSubmit}
                                    style={{backgroundColor: ourBlue}}>
                                    <Text style={{
                                        fontFamily: 'AEH',
                                        fontSize: 20,
                                        color: '#FFF',
                                        textAlign: 'right'
                                    }}> Submit </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Swiper>)
            }
        }
    }
}

// Style constants for different pages
const styles = StyleSheet.create({
    homeScreen1: {
        flex: 1,
        backgroundColor: ourBlue,
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },

    tutorialScreens: {
        flex: 1,
        backgroundColor: ourBlue,
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },

    finalTutScreen: {
        flex: 1,
        backgroundColor: ourBlue,
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },

    tutorialText1: {
        fontFamily: 'AEH',
        fontSize: 20,
        color: 'white',
        textAlign: 'center'
    },

    tutorialText2: {
        fontFamily: 'AEH',
        fontSize: 16,
        color: 'white',
        textAlign: 'center'
    },

    baseText: {
        fontFamily: 'AEH',
        marginTop: 40,
        fontSize: 40,
        marginBottom: 10,
        color: 'white',
    },
});

