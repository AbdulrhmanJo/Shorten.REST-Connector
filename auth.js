/**
 * Required function by Google data studio that will 
 * returns the Auth Type of this connector.
 * @return {object} The Auth type.
 */
function getAuthType() {
    var cc = DataStudioApp.createCommunityConnector();
    var AuthTypes = cc.AuthType;
    return cc
        .newAuthTypeResponse()
        .setAuthType(AuthTypes.KEY)
        .setHelpUrl("https://docs.shorten.rest/#section/Authentication")
        .build();
}

/**
 * Required function by Google data studio that will 
 * clear user credentials for the third-party service.
 * The function does not accept any parameters and the
 * response is empty
 */
function resetAuth() {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.deleteProperty('dscc.key');
}

/**
 * Required function by Google data studio that will 
 * determine if the authentication for the third-party service is valid.
 * @return {boolean} True if the auth service has access.
 */
function isAuthValid() {
    var userProperties = PropertiesService.getUserProperties();
    var key = userProperties.getProperty('dscc.key');
    // check if the key is vaild or not
    return checkForValidKey(key);
}

/**
 * Required function by Google data studio that will 
 * store the credentials passed in from Data Studio
 * afgter the user enters their credential information
 * on the communty connecter configuration page.
 * @param {Request} request The set credentials request.
 * @return {object} An object with an errorCode.
 */
function setCredentials(request) {
    var key = request.key;
    var validKey = checkForValidKey(key);
    if (!validKey) {
        return {
            errorCode: 'INVALID_CREDENTIALS'
        };
    }
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('dscc.key', key);
    return {
        errorCode: 'NONE'
    };
}

/**
 * Check if the provided key is valid through
 * a call to Shorten.REST API.
 * @param {key} provided key to check it.
 * @return {boolean} true if the response code was 200.
 */
function checkForValidKey(key) {
    var response = UrlFetchApp.fetch("https://api.shorten.rest/clicks", {
        "method": "GET",
        "headers": {
            "content-type": "application/json",
            "x-api-key": "" + key,
        },
        'muteHttpExceptions': true
    })
    return response.getResponseCode() !== 200 ? false : true
}