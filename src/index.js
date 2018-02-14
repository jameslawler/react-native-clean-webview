import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  WebView
} from 'react-native';
import readabilityJs from './readability';

export default class CleanWebView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fullHtmlSource: undefined,
      cleanHtmlSource: undefined,
      isClean: false
    };

    fetch(this.props.url)
      .then((webResponse) => webResponse.text())
      .then((webResponseText) => webResponseText.replace("</body>", readabilityJs(this.props.url) + "</body>"))
      .then((readabilityHtml) => {
        this.setState({
          fullHtmlSource: readabilityHtml,
          cleanHtmlSource: undefined,
          isClean: false
        });
      })
      .catch((error) => {
        console.log('error: ', error);
      });
  }

  render() {
    return (
       <View style={ styles.scene } >
        { this.state.fullHtmlSource &&
        <WebView
          style={ styles.hiddenWebView }
          source={ {html: this.state.fullHtmlSource} }
          onMessage={ (event) => {
            this.setState({
              fullHtmlSource: undefined,
              cleanHtmlSource: event.nativeEvent.data,
              isClean: true
            });
          } }
          />
        }
        { this.state.cleanHtmlSource &&
        <WebView
          style={ styles.webView }
          source={ {html: this.state.cleanHtmlSource, baseUrl: this.props.url} }
          />
        }
      </View> 
    );
  }
}

CleanWebView.PropTypes = {
  url: PropTypes.string.isRequired
}

const styles = StyleSheet.create({
  scene: {
    flex: 1
  },
  hiddenWebView: {
    height: 0,
    width: 0
  },
  webView: {
    flex: 1
  }
});