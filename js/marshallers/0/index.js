define([
    'vendor/pako',
    'vendor/base64-js',
    'vendor/buffer',
    'vendor/text-encoding/encoding',
], function (pako, base64js, buffer, encoding) {
    const Buffer = buffer.Buffer

    return class MarshallerVersion0 {
        static decode (str) {
            str = pako.inflate(Buffer.from(str, 'base64'))
            str = new TextDecoder("utf-8").decode(str)
            return [JSON.parse(str), str]
        }
    }
})