/**
 * Created by moadkj on 2/7/17.
 */

/**
 *  Module defnines the system configuration properties and
 *  provides the mechanisms used to acquire the needed information
 *  from the execution environment
 */

'use strict'
var sprintf = require("sprintf-js").sprintf

const configuration = {
    url: process.env.ADURL,
    dn: process.env.ADDN,
    user: process.env.UID,
    password: process.env.PWD,
    keys: {
        public: process.env.PUBLIC,
        private: process.env.PRIVATE
    },
    contexts: JSON.parse(process.env.CONTEXTS),
    passport:{
        identityMetadata: sprintf("https://login.microsoftonline.com/%1$s/v2.0/.well-known/openid-configuration", process.env.AZTENANT),
        clientID: process.env.AZCLIENTID,
        validateIssuer: true,
        issuer: process.env.AZISSUER,
        passReqToCallback: false
    },
    tokenOpts: {
        expiresInSeconds: parseInt(process.env.TOKEN_EXPIRES_SECONDS,10),
        issuer: process.env.TOKEN_ISSUER
    }
};

module.exports = {
    getADConfiguration: function() {
        return {
            url: configuration.url,
            baseDN: configuration.dn,
            username: configuration.user,
            password: configuration.password
        };
    },

    getCertificateConfig: function(){
        return {
            public: configuration.keys.public,
            private: configuration.keys.private
        };
    },

    getPassportOptions: function(){
        return configuration.passport;
    },

    getContexts: function(){
        return configuration.contexts;
    },

    getTokenOptions: function(){
        return configuration.tokenOpts;
    }
};

