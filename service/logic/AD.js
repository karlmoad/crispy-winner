/**
 * Created by moadkj on 2/9/17.
 */
'use strict';
const config = require('../config/config.js');
const ActiveDirectory = require('activedirectory');
const AD = new ActiveDirectory(config.getADConfiguration());
const passport = require('passport');
const OIDCBearerStrategy = require('passport-azure-ad').BearerStrategy;

module.exports = {
    authenticateUser: function(req, res, callback){
        // use passport azure ad to validate the access token provided by the client
        var bearerStrategy = new OIDCBearerStrategy(config.getPassportOptions(),
            function(token, done) {
                if(!token){
                    callback(true,true, null);  // we should never hit here due to the authenticate call prior in the call stack, but JIC
                }else {
                    AD.findUser(token.upn, function(err, user){  //find the user within the UPMC local Active Directory
                        if(err){
                            callback(true,false, null);  //SHTF somewhere send error
                        }else {
                            if (!user) {
                                callback(true, true, null); // OOPs didn't find the user in local AD, problem?
                            }else{
                                // flesh out base user object given data currently avail.
                                var userObj={};
                                userObj['uid'] = user.sAMAccountName;
                                userObj['email'] = user.mail;
                                userObj['firstName'] = token.given_name;
                                userObj['lastName'] = token.family_name;
                                userObj['ipaddr'] = token.ipaddr;
                                userObj['sid'] = token.onprem_sid;
                                userObj['upn'] = token.upn;
                                userObj['groups'] = [];
                                userObj['contexts'] = req.body.contexts;

                                // get the users groups from UPMC local AD
                                AD.getGroupMembershipForUser(user.sAMAccountName, function(err, groups){
                                    if(err){
                                        callback(true,false, null); //SHTF somewhere send error
                                    }else{
                                        if(groups){
                                            groups.forEach(function(group){
                                                userObj.groups.push(group.cn.toString());
                                            });
                                        }
                                        //console.log(JSON.stringify(userObj));
                                        callback(false, false, userObj);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        );

        passport.use(bearerStrategy);

        passport.authenticate('oauth-bearer', function(err, user, info) {
            if (err) callback(true, false, null);
            if (!user) {
                console.log(info);  //TODO send this to logging solution
                callback(true, true, null);
            }
            else{
                req.login(user, null);  // Make passport manually finalize the login process decoding the full token
            }
        })(req, res, function(){return});

        /*  actual final code keep
        var userObj ={};

        //find the user
        AD.findUser(loginRequest.userid, function(err, user){
            if(err){
                callback(true,false, null);
            }else {
                if (!user) {
                    callback(true, true, null);
                }else{
                    // we have a user get their groups

                    //console.log("Supplied ID: %s", loginRequest.userid);
                    //console.log("Principle ID: %s", user.userPrincipalName);
                    //console.log("User Obj: %s", JSON.stringify(user));

                    userObj['id'] = user.sAMAccountName;
                    userObj['email'] = user.mail;
                    userObj['groups'] = [];
                    userObj['contexts'] = loginRequest.contexts;

                    AD.getGroupMembershipForUser(userObj.id, function(err, groups){
                        if(err){
                            callback(true,false, null);
                        }else{
                            if(groups){
                                groups.forEach(function(group){
                                    userObj.groups.push(group.cn.toString());
                                });

                            }
                            //console.log(JSON.stringify(userObj));
                            callback(false, false, userObj);
                        }
                    });
                }
            }
        });

        */
    },
    verifyUserIsActive: function(uid, callback){
        AD.findUser(uid, function(err, user){  //find the user within the UPMC local Active Directory
            if(err){
                callback(true,false);  //SHTF somewhere send error
            }else {
                callback(false, true);
            }
        });
    }
};