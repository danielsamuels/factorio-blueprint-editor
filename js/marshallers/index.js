define([
    // Blueprint version parsers.
    './0/index'
], function(...marshallers) {
    return {
        'getMarshaller': function (version) {
            return marshallers[version]
        }
    }
})