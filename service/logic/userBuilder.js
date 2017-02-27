/**
 * Created by moadkj on 2/7/17.
 */
'use strict';
const config = require('../config/config.js');
const tokenBuilder = require("./tokenBuilder.js");
const AD= require('./AD.js');
const jwt = require('jsonwebtoken');
const keys = config.getCertificateConfig();

 module.exports = {

    login: function(req, res, callback){
        AD.authenticateUser(req, res, function(error, unauth, user){
           if(error || unauth){
               callback(error, unauth, null);
           } else{

               //TODO get context permissions based on Active Directory provided groups in the user object from context services

               //TODO ............end

               //get the token now that user object is fleshed out
               tokenBuilder.encode(user, function(error, token){
                   if(error){
                       callback(true, false, null);
                   }
                   else {
                       var responseObject = {user: user, token: token};
                       callback(false, false, responseObject);
                   }
               });
           }
        });
    },

    renew: function(req, res, callback){

    }

 };