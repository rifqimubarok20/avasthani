const {
  withGradleProperties,
} = require('expo/config-plugins');

function withNitroGoogleKotlinCompatibility(config) {
  return withGradleProperties(config, (config) => {
    const kotlinVersion = config.modResults.find(
      (property) => property.type === 'property' && property.key === 'android.kotlinVersion',
    );

    if (kotlinVersion) {
      kotlinVersion.value = '2.4.0';
    } else {
      config.modResults.push({
        type: 'property',
        key: 'android.kotlinVersion',
        value: '2.4.0',
      });
    }

    return config;
  });
}

module.exports = withNitroGoogleKotlinCompatibility;
