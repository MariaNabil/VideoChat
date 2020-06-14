import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Platform, PermissionsAndroid } from 'react-native';
import { Actions } from 'react-native-router-flux';
import requestCameraAndAudioPermission from './permission';
import RNCallKeep from 'react-native-callkeep';
//import uuid from 'uuid';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

class Home extends Component {

    constructor(props) {
        super(props);
        this.currentCallId = null;

        this.state = {
            AppID: '6d918f0a9354427c8d48a07e359c2fda',                    //Set your APPID here
            ChannelName: 'Maria',
            number: '',
            //   localVideoSrc: null,
            //   remoteVideoSrc: null,
            connected: false,
            ringing: false,
            inCall: false,
            error: null,                              //Set a default channel or leave blank
        };

        try {
            if (Platform.OS === 'android') {                    //Request required permissions from Android
                requestCameraAndAudioPermission().then(_ => {
                    console.log('requested!');
                });
            }
        } catch (error) {
            console.log('Erroooor !', error);
        }

    }

    componentWillMount() {
        // try {
        //     this.initializeCallKeep();
        // } catch (error) {
        //     console.log('componentWillMount', error);
        // }
    }


    initializeCallKeep = () => {
        // Initialise RNCallKit
        const options = {
            ios: {
                appName: 'WazoReactNativeDemo',
            },
            android: {
                alertTitle: 'Permissions Required',
                alertDescription:
                    'This application needs to access your phone calling accounts to make calls',
                cancelButton: 'Cancel',
                okButton: 'ok',
                imageName: 'sim_icon',
                additionalPermissions: [PermissionsAndroid.PERMISSIONS.READ_CONTACTS]
            }
        };

        try {
            RNCallKeep.setup(options).then(accepted => { RNCallKeep.setAvailable(true); });

        } catch (err) {
            console.error('initializeCallKeep error:', err.message);
        }

        // Add RNCallKit Events
        RNCallKeep.addEventListener('didReceiveStartCallAction', this.onNativeCall);
        RNCallKeep.addEventListener('answerCall', this.onAnswerCallAction);
        RNCallKeep.addEventListener('endCall', this.onEndCallAction);
        RNCallKeep.addEventListener('didDisplayIncomingCall', this.onIncomingCallDisplayed);
        RNCallKeep.addEventListener('didPerformSetMutedCallAction', this.onToggleMute);
        RNCallKeep.addEventListener('didPerformDTMFAction', this.onDTMF);
    };

    getCurrentCallId = () => {
        console.log('currentCallId', this.currentCallId);

        if (!this.currentCallId) {
            //this.currentCallId = uuid.v4();
            this.currentCallId = uuidv4();
            console.log('uuidv4', uuidv4());
            console.log('this.currentCallId', this.currentCallId);
        }

        return this.currentCallId;
    };

    call = (number) => {
        //const session = this.webRtcClient.call(number);
        //this.setupCallSession(session);

        this.setState({ inCall: true, ringing: false });

        console.log(number);
        // Tell callkeep that we are in call
        RNCallKeep.startCall(this.getCurrentCallId(), number);
    };

    answer = () => {
        this.setState({ inCall: true, ringing: false });

        //this.webRtcClient.answer(this.currentSession);
    };

    hangup = () => {
        const currentCallId = this.getCurrentCallId();
        // if (!this.currentSession || !currentCallId) {
        //     return;
        // }

        //this.webRtcClient.hangup(this.currentSession);

        RNCallKeep.endCall(currentCallId);
        this.setState({ inCall: false, ringing: false });
        this.currentCallId = null;
        //this.currentSession = null;
    };


    onNativeCall = ({ handle }) => {
        // Called when performing call from native Contact app
        this.call(handle);
    };

    onAnswerCallAction = ({ callUUID }) => {
        // called when the user answer the incoming call
        this.answer();
    };

    onEndCallAction = ({ callUUID }) => {
        this.hangup();
    };

    onIncomingCallDisplayed = error => {
        // You will get this event after RNCallKeep finishes showing incoming call UI
        // You can check if there was an error while displaying
    };

    onToggleMute = (muted) => {
        // Called when the system or the user mutes a call
        //this.webRtcClient[muted ? 'mute' : 'unmute'](this.currentSession);
    };

    onDTMF = (action) => {
        console.log('onDTMF', action);
    };

    handleSubmit = () => {
        let AppID = this.state.AppID;
        let ChannelName = this.state.ChannelName;
        if (AppID !== '' && ChannelName !== '') {
            Actions.video({ AppID, ChannelName });
        }
    }


    render() {
        return (
            <View style={styles.container}>

                <Text style={styles.formLabel}>Phone Number</Text>
                <TextInput
                    style={styles.formInput}
                    onChangeText={(number) => this.setState({ number })}
                    value={this.state.number}
                />

                <Text style={styles.formLabel}>App ID</Text>
                <TextInput
                    style={styles.formInput}
                    onChangeText={(AppID) => this.setState({ AppID })}
                    value={this.state.AppID}
                />
                <Text style={styles.formLabel}>Channel Name</Text>
                <TextInput
                    style={styles.formInput}
                    onChangeText={(ChannelName) => this.setState({ ChannelName })}
                    value={this.state.ChannelName}
                />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        title="Call Number"
                        onPress={() => {
                            // this.call(this.state.number);
                            this.initializeCallKeep();
                        }}
                        style={styles.submitButton}
                    >
                        <Text style={{ color: '#ffffff' }}> Start Call </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        title="Start Video!"
                        onPress={this.handleSubmit}
                        style={styles.submitButton}
                    >
                        <Text style={{ color: '#ffffff' }}> Start Video </Text>
                    </TouchableOpacity>
                </View>


            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        marginTop: 0,
        padding: 20,
        flex: 1,
        backgroundColor: '#ffffff',
    },
    formLabel: {
        paddingBottom: 10,
        paddingTop: 10,
        color: '#0093E9',
    },
    buttonContainer: {
        alignItems: 'center',
        paddingTop: 20,
    },
    submitButton: {
        paddingHorizontal: 60,
        paddingVertical: 10,
        backgroundColor: '#0093E9',
        borderRadius: 25,
    },
    formInput: {
        height: 40,
        backgroundColor: '#f5f5f5',
        color: '#0093E9',
        borderRadius: 4,
        paddingLeft: 20,
    },
});

export default Home;