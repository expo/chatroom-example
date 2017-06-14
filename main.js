import Expo, { Constants, Location, Permissions, WebBrowser } from 'expo';
import React, { Component } from 'react';
import { Platform, ListView, TextInput, TouchableHighlight, StyleSheet, Text, View } from 'react-native';

const io = require('socket.io-client');
const url = 'https://609cceab.ngrok.io';

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
   buttonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FAFAFA',
   },
   chatText: {
      fontSize: 16,
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
      message: 'default',
      lastMessage: 'not working',
      messageList: initialMessages,
      dataSource: ds.cloneWithRows(initialMessages),
      location: null,
      lastLocation: null,
    }
  }

  componentDidMount() {
    const socket = io(url, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      this.setState({ isConnected: true });
    });

    socket.on('ping', data => {
      this.setState(data);
    });

    socket.on('chat message', msg => {
      this.setState({ lastMessage: msg });
    });

    socket.on('location', location => {
      this.setState({ lastLocation: location });
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
    var siteAddress = 'https://www.google.com/maps/search/'
    + this.state.lastLocation.coords.latitude + ',+' + this.state.lastLocation.coords.longitude;
    let result = await WebBrowser.openBrowserAsync(siteAddress);
    this.setState({ lastLocation: null });
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
          {this.state.data &&
            <Text>
              ping response: {this.state.data}
            </Text>}
            <TouchableHighlight
              onPress={this.onAddPressed.bind(this)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                Send Message
              </Text>
            </TouchableHighlight>
            <TouchableHighlight
              onPress={this.onSharePressed.bind(this)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                Share Location
              </Text>
            </TouchableHighlight>
            <Text>connected: {this.state.isConnected ? 'true' : 'false'}</Text>
        </View>
      );
    } else {
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
          {this.state.data &&
            <Text>
              ping response: {this.state.data}
            </Text>}
            <TouchableHighlight
              onPress={this.onAddPressed.bind(this)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                Send Message
              </Text>
            </TouchableHighlight>
            <TouchableHighlight
              onPress={this.onSharePressed.bind(this)}
              style={styles.button}
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
            <Text>connected: {this.state.isConnected ? 'true' : 'false'}</Text>
        </View>
      );
    }
  }
}

Expo.registerRootComponent(App);
