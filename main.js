var cc = DataStudioApp.createCommunityConnector();

/**
 * required function by Google Data Studio that will
 * return the user configurable options for the connector.
 * @param {Object} request
 * @return {Object} fields
 */
function getConfig(request) {
    var config = cc.getConfig();
    return config.build();
}

/**
 * this function is to support getSchema(), it will
 * create the data set fields (metric & dimension) and
 * return fields that describe the schema.
 * @param {Object} request
 * @return {Object} fields
 */
function getFields(request) {
    var fields = cc.getFields();
    var types = cc.FieldType;
    var aggregations = cc.AggregationType;

    fields.newDimension()
        .setId("aliasName")
        .setType(types.TEXT);

    fields.newDimension()
        .setId("aliasId")
        .setType(types.TEXT);

    fields.newDimension()
        .setId("browser")
        .setType(types.TEXT);

    fields.newDimension()
        .setId("country")
        .setType(types.COUNTRY_CODE);

    fields.newDimension()
        .setId("date")
        .setType(types.YEAR_MONTH_DAY);

    fields.newDimension()
        .setId("hour")
        .setType(types.HOUR);

    fields.newDimension()
        .setId("destination")
        .setType(types.URL);

    fields.newDimension()
        .setId("domain")
        .setType(types.TEXT);

    fields.newDimension()
        .setId("opreatingSystem")
        .setType(types.TEXT);

    fields.newMetric()
        .setId("clickCount")
        .setType(types.NUMBER)
        .setAggregation(aggregations.COUNT)

    return fields;
}

/**
 * required function by Google Data Studio that will
 * return the schema for the given request.
 * This provides the information about how the connector's data is organized.
 * @param {Object} request
 * @return {Object} fields
 */
function getSchema(request) {
    var fields = getFields(request).build();
    return {
        schema: fields
    };
}

/**
 * takes the timeStamp for each click and convert it to yyyymmdd
 * @param {number} timeStamp
 * @return {string} date
 */
function getDate(timeStamp) {
    return new Date(timeStamp).toISOString().slice(0, 10).replace(/-/g, "");
}

/**
 * takes the timeStamp for each click and get the time from it
 * @param {number} timeStamp
 * @return {string} time
 */
function getHour(timeStamp) {
    return new Date(timeStamp).toTimeString().slice(0, 2);
}

/**
 * Takes the requested fields and the API response and
 * return rows formatted for Google Data Studio.
 * @param {Object} requestedFields
 * @param {Object} response
 * @return {Array} values
 */
function responseToRows(requestedFields, response) {
    // Transform parsed data and filter for requested fields
    return response.map(function (click, index) {
        var row = [];
        requestedFields.asArray().forEach(function (field) {
            switch (field.getId()) {
                case 'aliasName':
                    return row.push(click.alias);
                case 'aliasId':
                    return row.push(click.aliasId);
                case 'browser':
                    return row.push(click.browser);
                case 'country':
                    return row.push(click.country);
                case 'date':
                    return row.push(getDate(click.createdAt));
                case 'hour':
                    return row.push(getHour(click.createdAt));
                case 'destination':
                    return row.push(click.destination);
                case 'domain':
                    return row.push(click.domain);
                case 'opreatingSystem':
                    return row.push(click.os);
                case 'clickCount':
                    return row.push(response.length);
                default:
                    return row.push('');
            }
        });
        return {
            values: row
        };
    });
}


/**
 * required function by Google Data Studio that will
 * return the data as tables for the given request.
 * @param {Object} request
 * @return {Object}
 */
function getData(request) {
    // Create schema for requested fields
    var requestedFieldsIds = request.fields.map(function (field) {
        return field.name;
    });
    var requestedFields = getFields().forIds(requestedFieldsIds);
    var userProperties = PropertiesService.getUserProperties();
    var key = userProperties.getProperty('dscc.key');

    // Fetch and parse data from API
    var response = UrlFetchApp.fetch("https://api.shorten.rest/clicks", {
        "method": "GET",
        "headers": {
            "content-type": "application/json",
            "x-api-key": "" + key,
        },
    })
    var parsedResponse = JSON.parse(response).clicks;
    var rows = responseToRows(requestedFields, parsedResponse);
    // Transform parsed data and filter for requested fields
    return {
        schema: requestedFields.build(),
        rows: rows
    }
}