const supportedBrowsers = {
  microsoft: {
    ie11_win10: {
      browserName: 'internet explorer',
      name: 'IE11_Win10',
      platform: 'Windows 10',
      ignoreZoomSetting: true,
      nativeEvents: false,
      ignoreProtectedModeSettings: true,
      version: '11.285'
    },
    edge_win10: {
      browserName: 'MicrosoftEdge',
      name: 'Edge_Win10',
      platform: 'Windows 10',
      ignoreZoomSetting: true,
      nativeEvents: false,
      ignoreProtectedModeSettings: true,
      version: '18.17763'
    }
  },
  chrome: {
    chrome_win_latest: {
      browserName: 'chrome',
      name: 'DIV_WIN_CHROME_LATEST',
      platform: 'Windows 10',
      version: 'latest'
    },
    chrome_mac_latest: {
      browserName: 'chrome',
      name: 'MAC_CHROME_LATEST',
      platform: 'macOS 10.13',
      version: 'latest'
    }
  },
  firefox: {
    firefox_win_latest: {
      browserName: 'firefox',
      name: 'WIN_FIREFOX_LATEST',
      platform: 'Windows 10',
      version: 'latest'
    },
    firefox_mac_latest: {
      browserName: 'firefox',
      name: 'MAC_FIREFOX_LATEST',
      platform: 'macOS 10.13',
      version: 'latest'
    }
  },
  safari: {
    safari11: {
      browserName: 'safari',
      name: 'DIV_SAFARI_11',
      platform: 'macOS 10.13',
      version: '12.0',
      avoidProxy: true
    }
  }
};

module.exports = supportedBrowsers;
