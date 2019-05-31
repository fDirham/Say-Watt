import React from 'react';
import { ActivityIndicator, StyleSheet, Button, View, Text, Image, Alert, FlatList} from 'react-native';

class onandoff extends React.Component {
    turnOn(ip) {
        console.log('PRESSED: ON' + ip)
        return fetch('http://' + ip, {
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
                console.log(x);
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

    turnOff(ip) {
        console.log(ip)
        return fetch('http://' + ip, {
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
}

export default onandoff