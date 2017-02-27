/**
 * Created by moadkj on 2/9/17.
 */
'use strict';
const config = require('../config/config.js');
const jwt = require('jsonwebtoken');
const tokenOpts = config.getTokenOptions();
const keys = config.getCertificateConfig();

module.exports = {

    encode: function(userObject, callback){
        //TODO switch to RSA256, once App engineering decides method of management
        jwt.sign(user, keys.private, {algorithm: 'HS512', expiresIn: tokenOpts.ExpiresinSeconds, issuer: tokenOpts.issuer}, callback);
    },

    decode: function(token, callback){

    },
};

