import React, { Component } from 'react';
import { View, StyleSheet, NativeModules, Platform } from 'react-native';
import { RtcEngine, AgoraView } from 'react-native-agora';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Actions } from 'react-native-router-flux';

const { Agora } = NativeModules;                  //Define Agora object as a native module

const {
    FPS30,
    AudioProfileDefault,
    AudioScenarioDefault,
    Adaptative,
} = Agora;                                        //Set defaults for Stream

class Video extends Component {
    constructor(props) {
        super(props);
        this.state = {
            peerIds: [],                                //Array for storing connected peers
            uid: Math.floor(Math.random() * 100),       //Generate a UID for local user
            appid: this.props.AppID,                    //Enter the App ID generated from the Agora Website
            channelName: this.props.ChannelName,        //Channel Name for the current session
            vidMute: false,                             //State variable for Video Mute
            audMute: false,                             //State variable for Audio Mute
            joinSucceed: false,                         //State variable for storing success
        };
        if (Platform.OS === 'android') {
            const config = {                            //Setting config of the app
                appid: this.state.appid,                  //App ID
                channelProfile: 0,                        //Set channel profile as 0 for RTC
                videoEncoderConfig: {                     //Set Video feed encoder settings
                    width: 720,
                    height: 1080,
                    bitrate: 1,
                    frameRate: FPS30,
                    orientationMode: Adaptative,
                },
                audioProfile: AudioProfileDefault,
                audioScenario: AudioScenarioDefault,
            };
            RtcEngine.init(config);                     //Initialize the RTC engine
        }
    }

    componentDidMount() {
        RtcEngine.on('userJoined', (data) => {
            const { peerIds } = this.state;             //Get currrent peer IDs
            if (peerIds.indexOf(data.uid) === -1) {     //If new user has joined
                this.setState({
                    peerIds: [...peerIds, data.uid],        //add peer ID to state array
                });
            }
        });
        RtcEngine.on('userOffline', (data) => {       //If user leaves
            this.setState({
                peerIds: this.state.peerIds.filter(uid => uid !== data.uid), //remove peer ID from state array
            });
        });
        RtcEngine.on('joinChannelSuccess', (data) => {                   //If Local user joins RTC channel
            RtcEngine.startPreview();                                      //Start RTC preview
            this.setState({
                joinSucceed: true,                                           //Set state variable to true
            });
        });
        RtcEngine.joinChannel(this.state.channelName, this.state.uid);  //Join Channel
        RtcEngine.enableAudio();                                        //Enable the audio
    }

    toggleAudio = () => {
        let mute = this.state.audMute;
        console.log('Audio toggle', mute);
        RtcEngine.muteLocalAudioStream(!mute);
        this.setState({
            audMute: !mute,
        });
    }

    toggleVideo = () => {
        let mute = this.state.vidMute;
        console.log('Video toggle', mute);
        this.setState({
            vidMute: !mute,
        });
        RtcEngine.muteLocalVideoStream(!this.state.vidMute);
    }

    endCall() {
        RtcEngine.destroy();
        Actions.home();
    }

    videoView() {
        return (
            <View style={{ flex: 1 }}>
                {
                    this.state.peerIds.length > 3                                     //view for four videostreams
                        ? <View style={{ flex: 1 }}>
                            <View style={{ flex: 1 / 2, flexDirection: 'row' }}><AgoraView style={{ flex: 1 / 2 }}
                                remoteUid={this.state.peerIds[0]}
                                mode={1} />
                                <AgoraView style={{ flex: 1 / 2 }}
                                    remoteUid={this.state.peerIds[1]}
                                    mode={1} /></View>
                            <View style={{ flex: 1 / 2, flexDirection: 'row' }}><AgoraView style={{ flex: 1 / 2 }}
                                remoteUid={this.state.peerIds[2]}
                                mode={1} />
                                <AgoraView style={{ flex: 1 / 2 }}
                                    remoteUid={this.state.peerIds[3]}
                                    mode={1} /></View>
                        </View>
                        : this.state.peerIds.length > 2                                 //view for three videostreams
                            ? <View style={{ flex: 1 }}>
                                <View style={{ flex: 1 / 2 }}><AgoraView style={{ flex: 1 }}
                                    remoteUid={this.state.peerIds[0]}
                                    mode={1} /></View>
                                <View style={{ flex: 1 / 2, flexDirection: 'row' }}><AgoraView style={{ flex: 1 / 2 }}
                                    remoteUid={this.state.peerIds[1]}
                                    mode={1} />
                                    <AgoraView style={{ flex: 1 / 2 }}
                                        remoteUid={this.state.peerIds[2]}
                                        mode={1} /></View>
                            </View>
                            : this.state.peerIds.length > 1                              //view for two videostreams
                                ? <View style={{ flex: 1 }}><AgoraView style={{ flex: 1 }}
                                    remoteUid={this.state.peerIds[0]}
                                    mode={1} /><AgoraView style={{ flex: 1 }}
                                        remoteUid={this.state.peerIds[1]}
                                        mode={1} /></View>
                                : this.state.peerIds.length > 0                             //view for videostream
                                    ? <AgoraView style={{ flex: 1 }}
                                        remoteUid={this.state.peerIds[0]}
                                        mode={1} />
                                    : <View />
                }
                {
                    !this.state.vidMute                                              //view for local video
                        ? <AgoraView style={styles.localVideoStyle} zOrderMediaOverlay={true} showLocalVideo={true} mode={1} />
                        : <View />
                }
                <View style={styles.buttonBar}>
                    <Icon.Button style={styles.iconStyle}
                        backgroundColor="#0093E9"
                        name={this.state.audMute ? 'mic-off' : 'mic'}
                        onPress={() => this.toggleAudio()}
                    />
                    <Icon.Button style={styles.iconStyle}
                        backgroundColor="#0093E9"
                        name="call-end"
                        onPress={() => this.endCall()}
                    />
                    <Icon.Button style={styles.iconStyle}
                        backgroundColor="#0093E9"
                        name={this.state.vidMute ? 'videocam-off' : 'videocam'}
                        onPress={() => this.toggleVideo()}
                    />
                </View>
            </View>
        );
    }

    render() {
        return this.videoView();
    }
}

const styles = StyleSheet.create({
    buttonBar: {
        height: 50,
        backgroundColor: '#0093E9',
        display: 'flex',
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
    },
    localVideoStyle: {
        width: 140,
        height: 160,
        position: 'absolute',
        top: 5,
        right: 5,
        zIndex: 100,
    },
    iconStyle: {
        fontSize: 34,
        paddingTop: 15,
        paddingLeft: 40,
        paddingRight: 40,
        paddingBottom: 15,
        borderRadius: 0,
    },
});

export default Video;