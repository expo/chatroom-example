import Expo from 'expo';
import React from 'react';
import { ListView, TextInput, TouchableHighlight, StyleSheet, Text, View } from 'react-native';
const io = require('socket.io-client');
const url = 'https://f7c9e9a5.ngrok.io';

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
      fontSize: 18,
      fontWeight: '600',
      color: '#FAFAFA',
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
    var initialMessages = ['Hello! Welcome to the chatroom.', 'Messages sent will appear here...'];
    this.state = {
      isConnected: false,
      data: null,
      message: 'default',
      lastMessage: 'not working',
      messageList: initialMessages,
      dataSource: ds.cloneWithRows(initialMessages),
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
      var newMessages = [];
      newMessages = this.state.messageList.slice();
      // change array
      newMessages.push(msg);

      this.setState({
        messageList: newMessages,
        dataSource: this.state.dataSource.cloneWithRows(newMessages),
      });
    });
  }

  onChange(text) {
    this.setState({
        message: text
    });
  }

  onAddPressed() {
    const socket = io(url, {
      transports: ['websocket'],
    });

    socket.emit('chat message', this.state.message);
  }

  render() {
    return (
      <View style={styles.container}>
        <ListView
          dataSource = {this.state.dataSource}
          renderRow = {(rowData) => <Text>{rowData}</Text>}
        />
        <TextInput
          style={styles.input}
          onChangeText={this.onChange.bind(this)}
        />
        <Text>last message: {this.state.lastMessage}</Text>
        <Text>connected: {this.state.isConnected ? 'true' : 'false'}</Text>
        {this.state.data &&
          <Text>
            ping response: {this.state.data}
          </Text>}
          <TouchableHighlight
            onPress={this.onAddPressed.bind(this)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              Send
            </Text>
          </TouchableHighlight>
      </View>
    );
  }
}

Expo.registerRootComponent(App);
