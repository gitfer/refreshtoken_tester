var config = {};

config.client_settings = {};
config.server_settings = {};
config.api = {};

config.client_settings.client_id = process.env.CLIENT_ID || 'CLIENTID';
config.client_settings.secret = process.env.SECRET || 'CLIENTSECRET';
config.client_settings.username = 'USERNAME';
config.client_settings.password = 'PASSWORD';

config.server_settings.authorization_server = process.env.AUTHORIZATION_SERVER || 'http://localhost/AuthorizationServer';
config.server_settings.resource_server = process.env.RESOURCE_SERVER || 'http://localhost/ResourceServer';

config.api.test_method = 'GET';
config.api.test_resource = 'PasswordConstraints';

config.api.require_new_access_token_via_refresh_token = 1;
config.api.test_timeout_after_new_token = 2000;
config.api.request_new_token_via_refresh_token_delay = 32000;

module.exports = config