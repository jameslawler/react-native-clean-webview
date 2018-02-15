import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  WebView
} from 'react-native';
import readabilityJs from './readability';
import cleanHtmlTemplate from './cleanHtmlTemplate';
import cleanHtmlCss from './cleanHtmlCss';
import scriptRemover from 'script_sanitize';

export default class CleanWebView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fullHtmlSource: undefined,
      cleanHtmlSource: undefined
    };

    fetch(this.props.url)
      .then((webResponse) => webResponse.text())
      .then((webResponseText) => {
        let withoutScripts = scriptRemover.sanitize(webResponseText);
        let readHtml = withoutScripts.replace("</body>", readabilityJs(this.props.url) + "</body>");
        return readHtml;
      })
      .then((readabilityHtml) => {
        this.setState({
          fullHtmlSource: readabilityHtml,
          cleanHtmlSource: undefined
        });
      })
      .catch((error) => {
        if (this.props.onError) {
          this.props.onError(error);
        }
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
            if (!event.nativeEvent.data) {
              if (this.props.onError) {
                this.props.onError(new Error('Could not clean HTML'));
              }
              return;
            }

            let readabilityArticle = JSON.parse(event.nativeEvent.data);
            let cleanHtml = '';

            if (this.props.htmlCss) {
              cleanHtml = cleanHtmlTemplate(this.props.htmlCss, readabilityArticle.title, readabilityArticle.content);
            } else {
              cleanHtml = cleanHtmlTemplate(cleanHtmlCss, readabilityArticle.title, readabilityArticle.content);
            }

            if (this.props.onCleaned) {
              this.props.onCleaned(readabilityArticle, cleanHtml);
            }

            this.setState({
              fullHtmlSource: undefined,
              cleanHtmlSource: cleanHtml
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
  url: PropTypes.string.isRequired,
  htmlCss: PropTypes.string,
  onCleaned: PropTypes.func,
  onError: PropTypes.func
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    backgroundColor: 'white'
  },
  hiddenWebView: {
    height: 0,
    width: 0
  },
  webView: {
    flex: 1
  }
});