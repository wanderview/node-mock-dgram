# mock-dgram

Mock UDP socket using object streams

[![Build Status](https://travis-ci.org/wanderview/node-mock-dgram.png)](https://travis-ci.org/wanderview/node-mock-dgram)

## Example

```javascript
var MockDgram = require('mock-dgram');

var md = new MockDgram();

var msgIn = {
  ip: { src: '1.1.1.1' },
  udp: { srcPort: 52, dataLength: 500 }
  data: new Buffer(500)
};

md.on('message', function (buf, rinfo) {
  test.deepEqual(msgIn.data, buf);      // true
  rinfo.address === msgIn.ip.src;       // true
  rinfo.port === msgIn.udp.srcPort;     // true
  rinfo.size === msgIn.udp.dataLength;  // true
});
md.input.write(msgIn);

var bufOut = new Buffer(100);
var portOut = 52;
var addressOut = '1.1.1.1';

md.send(bufOut, 0, bufOut.length, portOut, addressOut);

var msgOut = md.output.read();

test.deepEqual(bufOut, msgOut.data);    // true
msgOut.ip.dst === addressOut;           // true
msgOut.udp.dstPort === portOut;         // true
```

## Description

Provide a mock implementation of the [dgram.Socket][] API.

Inject data into the mock using the `input` [PassThrough][] stream.  This data
will then be emitted via the `'message'` event.

Receive data passed to the `send()` function by reading from the `output`
[PassThrough][] stream.

[dgram.Socket]: http://nodejs.org/api/dgram.html#dgram_class_socket
[PassThrough]: http://nodejs.org/docs/v0.9.11/api/stream.html#stream_class_stream_passthrough
