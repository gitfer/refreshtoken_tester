var config = require('./config');
var colors = require('colors');

var token;
var retryCount = 0;

var oauth2 = require('simple-oauth2')({
  clientID: config.client_settings.client_id,
  clientSecret: config.client_settings.secret,
  site: config.server_settings.authorization_server,
  tokenPath: '/oauth/token'
});
var resource_caller = require('simple-oauth2')({
  clientID: config.client_settings.client_id,
  clientSecret: config.client_settings.secret,
  site: config.server_settings.resource_server
});

var requireNewAccessTokenViaRefreshToken = function () {

  if(retryCount < config.api.require_new_access_token_via_refresh_token ){
    
    console.log( '=========== '.green + (retryCount+1) + ' time ============= '.green + token.token.refresh_token.substring(0, 8));    

    token.refresh(function(error, result) {
      if(error !== null){
        console.log(colors.red('ERROR ', JSON.stringify(error)));
        process.exit()
      }
      retryCount = retryCount + 1;
      console.log('new Token --> access_token'.green, result.token.access_token);
      console.log('             --> refresh_token'.green, result.token.refresh_token);

      token = result;

      setTimeout(function () {
        var obj = { method: config.api.test_method, resource: '/api/' + config.api.test_resource};

        resource_caller.api(obj.method, obj.resource, {
          access_token: token.token.access_token
        }, handleResourceResult); 
      }, config.api.test_timeout_after_new_token);
    });
  }else{
      console.log('Max client retries finished. Exiting.'.green);
  }
};

var handleResourceResult = function (err, data) {
  if(err !== null){
    console.log(colors.red('ERROR ', JSON.stringify(err)));
    if(err.message && err.message === 'Authorization has been denied for this request.'){
        console.log(colors.red('Authorization has been denied. I\'m gonna try with refresh token ' + config.api.request_new_token_via_refresh_token_delay + ' seconds from now' , token.token.refresh_token));
        setTimeout(function () {
          requireNewAccessTokenViaRefreshToken();    
        }, config.api.request_new_token_via_refresh_token_delay);
        
    }
    return false;
  }
  else{
      setTimeout(function () {
        callResource({ method: config.api.test_method, resource: '/api/' + config.api.test_resource});      
      }, 2000); 
  }
  
  console.log(colors.green('DATA FOUND!'));
  console.log(data);
  return true;
};

var callResource = function(obj, authData) {
  console.log( 'Calling resource...'.green);    
  resource_caller.api(obj.method, obj.resource, {
    access_token: token.token.access_token
  }, handleResourceResult); 
};

var saveToken = function (error, result) {
  if (error) { 
    console.log( colors.red('Access Token Error: ', error.error)); 
    console.log( colors.red('error_description: ', error.error_description)); 
  }
  token = oauth2.accessToken.create(result);
  console.log( 'Token found!', JSON.stringify(token));

  callResource({ method: config.api.test_method, resource: '/api/' + config.api.test_resource});
};

var getToken = function () {
  console.log(colors.green('Requesting token with settings:', JSON.stringify(config.client_settings)));

  oauth2.password.getToken({
    username: config.client_settings.username,
    password: config.client_settings.password
  }, saveToken);
};


getToken();