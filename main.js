import Expo, { Components, Constants, Location, Permissions, WebBrowser } from 'expo';
import React, { Component } from 'react';
import { Platform, ListView, TextInput, TouchableHighlight, TouchableOpacity, StyleSheet, Text, View, Dimensions } from 'react-native';

const io = require('socket.io-client');
const url = 'https://609cceab.ngrok.io';
var {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingTop: 20,
      marginLeft: 10,
      backgroundColor: '#F7F7F7',
      paddingBottom: 50,
   },
   input: {
      borderWidth: 1,
      borderColor: '#D7D7D7',
      height: 50,
      marginLeft: 10,
      marginRight: 10,
      padding: 15,
      borderRadius: 3,
   },
   button: {
      height: 45,
      alignSelf: 'stretch',
      backgroundColor: '#05A5D1',
      marginTop: 10,
      marginLeft: 10,
      marginRight: 10,
      alignItems: 'center',
      justifyContent: 'center',
   },
   buttonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FAFAFA',
   },
   chatText: {
      fontSize: 16,
   },
   map: {
     width: width,
     height: height - 67,
   },
});

class App extends React.Component {
  constructor() {
    super();
    var ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    var initialMessages = ['Hello! Welcome to the chatroom.', 'Send your first message to view the last 20 messages.'];
    this.state = {
      isConnected: false,
      data: null,
      message: ' ',
      lastMessage: 'no previous messages',
      messageList: initialMessages,
      dataSource: ds.cloneWithRows(initialMessages),
      location: null,
      lastLocation: null,
      inMapView: false,
      latitude: 35.4478014,
      longitude: -120.1680304,
      buttonStyle: {
         height: 45,
         alignSelf: 'stretch',
         backgroundColor: '#E1E1E1',
         marginTop: 10,
         marginLeft: 10,
         marginRight: 10,
         alignItems: 'center',
         justifyContent: 'center',
      },
    }
  }

  componentDidMount() {
    const socket = io(url, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      this.setState({
        isConnected: true,
        buttonStyle: {
          height: 45,
          alignSelf: 'stretch',
          backgroundColor: '#05A5D1',
          marginTop: 10,
          marginLeft: 10,
          marginRight: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }
      });
    });

    socket.on('ping', data => {
      this.setState(data);
    });

    socket.on('chat message', msg => {
      this.setState({ lastMessage: msg });
    });

    socket.on('location', location => {
      this.setState({
        lastLocation: location,
      });
      this.setState({
        longitude: this.state.lastLocation.coords.longitude,
        latitude: this.state.lastLocation.coords.latitude,
      });
    });

    socket.on('message list', list => {
      this.setState({
        messageList: list,
        dataSource: this.state.dataSource.cloneWithRows(list),
      })
    });
  }

  onChange(text) {
    this.setState({
        message: text
    });
  }

  onAddPressed() {
    this.refs['chatInput'].clear();

    const socket = io(url, {
      transports: ['websocket'],
    });

    socket.emit('chat message', this.state.message);
  }

  onSharePressed() {
    this._getLocationAsync();
  }

  onMapPressed() {
    this.setState({
      lastLocation: null,
      inMapView: false,
    });
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });

    const socket = io(url, {
      transports: ['websocket'],
    });

    socket.emit('chat message', this.state.location);
  };

  _handlePressButtonAsync = async () => {
    this.setState({ inMapView: true });
  };

  render() {
    if (this.state.lastLocation == null) {
      return (
        <View style={styles.container}>
          <ListView
            dataSource = {this.state.dataSource}
            renderRow = {(rowData) => <Text style={styles.chatText}>{rowData}</Text>}
          />
          <TextInput
            ref={'chatInput'}
            style={styles.input}
            onChangeText={this.onChange.bind(this)}
          />
            <TouchableHighlight
              onPress={this.onAddPressed.bind(this)}
              style={this.state.buttonStyle}
            >
              <Text style={styles.buttonText}>
                Send Message
              </Text>
            </TouchableHighlight>
            <TouchableHighlight
              onPress={this.onSharePressed.bind(this)}
              style={this.state.buttonStyle}
            >
              <Text style={styles.buttonText}>
                Share Location
              </Text>
            </TouchableHighlight>
        </View>
      );
    } else if (this.state.inMapView == false) {
      return (
        <View style={styles.container}>
          <ListView
            dataSource = {this.state.dataSource}
            renderRow = {(rowData) => <Text style={styles.chatText}>{rowData}</Text>}
          />
          <TextInput
            style={styles.input}
            onChangeText={this.onChange.bind(this)}
          />
            <TouchableHighlight
              onPress={this.onAddPressed.bind(this)}
              style={this.state.buttonStyle}
            >
              <Text style={styles.buttonText}>
                Send Message
              </Text>
            </TouchableHighlight>
            <TouchableHighlight
              onPress={this.onSharePressed.bind(this)}
              style={this.state.buttonStyle}
            >
              <Text style={styles.buttonText}>
                Share Location
              </Text>
            </TouchableHighlight>
            <TouchableHighlight
              onPress={this._handlePressButtonAsync}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                View Last Shared Location
              </Text>
            </TouchableHighlight>
        </View>
      );
    } else {
      return (
        <View>
          <Components.MapView
            style={styles.map}
            region={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
          <Components.MapView.Marker
            coordinate={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
            }}
          />
          </Components.MapView>
          <TouchableOpacity style={styles.button} onPress={this.onMapPressed.bind(this)}>
            <Text style={styles.buttonText}> Back to Chatroom </Text>
          </TouchableOpacity>
        </View>
      );
    }
  }
}

Expo.registerRootComponent(App);
