/**
 * Created by moadkj on 2/09/17.
 */

var AuthorizationContext = (function(){

    'use strict'

    AuthorizationContext = function(options){

        //Constants

        this.CONSTANTS = {
            USER_TOKEN : 'user_token',
            USER_OBJ: 'user_obj',
            TOKEN_EXPIRATION: 'token_exp',
        };
        // constants end ************

        //Add other option handling/defaults here

        this._config = {contexts:[],
                        logout: null,
                        storeToken: false,
                        urls:{}};

        if(!options || !options.authorizeUrl){
            throw new Error('URL for authorization service must be supplied')
        }else{
            this._config.urls['login'] = options.authorizeUrl + '/login';
            this._config.urls['renew'] = options.authorizeUrl + '/renew';
        }

        if(options.contexts){
            this._config.contexts = options.contexts;
        }

        if(options.logout && typeof options.logout === 'function'){
            this._config.logout = options.logout;
        }

        //Set default cache to local storage
        if(!options.cacheLocation || options.cacheLocation.trim().length == 0){
            options.cacheLocation = "localStorage";
        }

        if(options.storeToken) {
            this._config.storeToken = options.storeToken;

            if(this._config.storeToken) {
                if (options.cacheLocation.substring(0, 5).toLowerCase() === 'local') {
                    if (this._supportsLocalStorage()) {
                        this._storage = localStorage;
                    } else {
                        throw new Error("local storage is not supported");
                    }
                } else {
                    if (this._supportsSessionStorage()) {
                        this._storage = sessionStorage;
                    } else {
                        throw new Error("session storage is not supported");
                    }
                }
            }
        }
        // option handling end*******
    };

    AuthorizationContext.prototype.authorize = function(token, callback){

        //make sure callback was provided
        if (!callback || typeof callback !== 'function') {
            throw new Error('callback is not a function');
        }

        //make sure token was passed
        if(!token){
            callback('access token not provided', null)
        }

        if(!this._config.urls.login){
            callback('unknown/invalid authorization url',null)
        }

        var handler = this._handleServiceResponse.bind(this);

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(xhr.readyState === XMLHttpRequest.DONE){
                handler(xhr.status, xhr.statusText, xhr.responseText, callback);
            }
        };

        xhr.open("POST", this._config.urls.login , true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");

        var body = null;
        try{
            body = {access_token: token, contexts: this._config.contexts};
        }
        catch(error){
            console.log(error);
        }

        if(body){
            xhr.send(JSON.stringify(body));
        }else{
            callback("Error constructing request",null);
        }
    };

    AuthorizationContext.prototype.renew = function(callback){

        //make sure token was passed
        var token = this._get(this.CONSTANTS.USER_TOKEN);

        //make sure callback was provided
        if (!callback || typeof callback !== 'function') {
            throw new Error('callback is not a function');
        }

        //make sure token was passed
        if(!token){
            callback('authorization token not found', null)
        }

        if(!this._config.urls.renew){
            callback('unknown/invalid authorization url',null)
        }

        var handler = this._handleServiceResponse.bind(this);

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(xhr.readyState === XMLHttpRequest.DONE){
                handler(xhr.status, xhr.statusText, xhr.responseText, callback);
            }
        };

        xhr.open("POST", this._config.urls.renew , true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");

        var body = null;
        try{
            body = {authorization_token: token};
        }
        catch(error){
            console.log(error);
        }

        if(body){
            xhr.send(JSON.stringify(body));
        }else{
            callback("Error constructing request",null);
        }
    };

    AuthorizationContext.prototype.logOut = function(){
        if(this._config.storeToken){
            for(var key in this.CONSTANTS){
                if(this.CONSTANTS.hasOwnProperty(key)){
                    this._purge(key);
                }
            }
        }

        if(this._config.logout){
            this._config.logout();
        }
    };

    AuthorizationContext.prototype.getAuthorizationToken = function(){
        if(this._config.storeToken) {
            return this._get(this.CONSTANTS.USER_TOKEN);
        }else{
            return null;
        }
    };

    AuthorizationContext.prototype.getAuthorizedUserInformation = function(){
        if(this._config.storeToken) {
            return JSON.parse(this._get(this.CONSTANTS.USER_OBJ));
        }else{
            return null;
        }
    };

    AuthorizationContext.prototype.isTokenExpired = function(){
        return (parseInt(this._get(this.CONSTANTS.TOKEN_EXPIRATION)) - Math.floor(Date.now() / 1000)) > 0
    };

    AuthorizationContext.prototype.getTokenExpirationInSeconds = function(){
        return (parseInt(this._get(this.CONSTANTS.TOKEN_EXPIRATION)) - Math.floor(Date.now() / 1000))
    };

    AuthorizationContext.prototype._handleServiceResponse = function(status, desc, respBody, callback){
        if(status === 200 && respBody){
            var resp = JSON.parse(respBody);
            if(this._config.storeToken){
                this._store(this.CONSTANTS.USER_TOKEN, resp.token);
                this._store(this.CONSTANTS.TOKEN_EXPIRATION, resp.user.exp.toString());
                this._store(this.CONSTANTS.USER_OBJ, JSON.stringify(resp.user));
            }
            callback(null, resp);
        }else{
            console.log("Authorization token could not be acquired, Status Code: %d, %s", status, desc);
            callback("Authorization token could not be acquired", null);
        }
    };

    AuthorizationContext.prototype._store = function(key, value){
        this._storage.setItem(key,value);
    };

    AuthorizationContext.prototype._get = function(key){
        return this._storage.getItem(key);
    };

    AuthorizationContext.prototype._purge = function(key){
        localStorage.removeItem(key)
    };

    AuthorizationContext.prototype._supportsLocalStorage = function () {
        try {
            var supportsLocalStorage = 'localStorage' in window && window['localStorage'];
            if (supportsLocalStorage) {
                window.localStorage.setItem('storageTest', '');
                window.localStorage.removeItem('storageTest');
            }
            return supportsLocalStorage;
        } catch (e) {
            return false;
        }
    };

    AuthorizationContext.prototype._supportsSessionStorage = function () {
        try {
            var supportsSessionStorage = 'sessionStorage' in window && window['sessionStorage'];
            if (supportsSessionStorage) {
                window.sessionStorage.setItem('storageTest', '');
                window.sessionStorage.removeItem('storageTest');
            }
            return supportsSessionStorage;
        } catch (e) {
            return false;
        }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AuthorizationContext;
        module.exports.inject = function (options) {
            return new AuthorizationContext(options);
        };
    }

    return AuthorizationContext;
}());
