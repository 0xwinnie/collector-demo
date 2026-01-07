// webpack.config.js
module.exports = {
    //...
    externals: {
        ['@solana/kit']: 'commonjs @solana/kit',
        ['@solana-program/memo']: 'commonjs @solana-program/memo',
        ['@solana-program/system']: 'commonjs @solana-program/system',
        ['@solana-program/token']: 'commonjs @solana-program/token'
    }
};

// next.config.js
module.exports = {
    webpack: (config) => {
        // ...
        config.externals['@solana/kit'] = 'commonjs @solana/kit';
        config.externals['@solana-program/memo'] = 'commonjs @solana-program/memo';
        config.externals['@solana-program/system'] = 'commonjs @solana-program/system';
        config.externals['@solana-program/token'] = 'commonjs @solana-program/token';
        return config;
    }
};