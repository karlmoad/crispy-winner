/**
 * Created by moadkj on 2/9/17.
 */
'use strict';
const config = require('../config/config.js');
const jwt = require('jsonwebtoken');
const tokenOpts = config.getTokenOptions();
const keys = config.getCertificateConfig();

module.exports = {

    encode: function(obj, callback){
        //TODO switch to RSA256, once App engineering decides method of management

        //Set token expiration time
        obj['exp'] = Math.floor(Date.now() / 1000) + tokenOpts.expiresInSeconds;
        //go for it
        jwt.sign(obj, keys.private, {algorithm: 'HS512', issuer: tokenOpts.issuer}, callback);

    },

    decode: function(token, callback){
        jwt.verify(token, keys.public, {algorithm: 'HS512', issuer: tokenOpts.issuer}, callback);
    },
};

