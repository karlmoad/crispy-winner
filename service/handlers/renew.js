'use strict';
var userBuilder = require("../logic/userBuilder.js");
/**
 * Operations on /login
 */
module.exports = {
    /**
     * summary: Authenticate a user and acquire group memberships and associated application permission context(s)
     * description: 
     * parameters: body
     * produces: application/json
     * responses: 200, 401, 500
     */
    post: function userLogin(req, res, next) {

        userBuilder.renew(req, res, function(error, unauth, responseObj){
            if(error){
                if(unauth){
                    res.status(401).send();
                }else
                {
                    res.status(500).send();
                }
            }else{
                res.status(200).json(responseObj);
            }
        });
    }
};
