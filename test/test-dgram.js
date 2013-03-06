// Copyright (c) 2013, Benjamin J. Kelly ("Author")
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

'use strict';

var MockDgram = require('../dgram');

var IpHeader = require('ip-header');
var net = require('net');
var UdpHeader = require('udp-header');

module.exports.bufferDefaults = function(test) {
  test.expect(4);

  var input = new Buffer(100);
  for (var i = 0, n = input.length; i < n; ++i) {
    input.writeUInt8(i & 0xff, i);
  }

  var dgram = new MockDgram();

  dgram.on('message', function(buf, rinfo) {
    test.deepEqual(input, buf);
    test.ok(net.isIPv4(rinfo.address));
    test.ok('number', typeof rinfo.port);
    test.equal(buf.length, rinfo.size);
  });

  dgram.on('close', function() {
    test.done();
  });

  dgram.input.write(input);
  dgram.input.end();
};

module.exports.bufferOverride = function(test) {
  test.expect(4);

  var input = new Buffer(100);
  for (var i = 0, n = input.length; i < n; ++i) {
    input.writeUInt8(i & 0xff, i);
  }

  var src = '1.2.3.4';
  var srcPort = 52;

  var dgram = new MockDgram({defaultSrc: src, defaultSrcPort: srcPort});

  dgram.on('message', function(buf, rinfo) {
    test.deepEqual(input, buf);
    test.equal(src, rinfo.address);
    test.equal(srcPort, rinfo.port);
    test.equal(buf.length, rinfo.size);
  });

  dgram.on('close', function() {
    test.done();
  });

  dgram.input.write(input);
  dgram.input.end();
};

module.exports.object = function(test) {
  test.expect(4);

  var input = {
    data: new Buffer(100),
    ip: new IpHeader({src: '5.4.3.2'}),
    udp: new UdpHeader({srcPort: 123})
  }

  for (var i = 0, n = input.data.length; i < n; ++i) {
    input.data.writeUInt8(i & 0xff, i);
  }

  var dgram = new MockDgram();

  dgram.on('message', function(buf, rinfo) {
    test.deepEqual(input.data, buf);
    test.equal(input.ip.src, rinfo.address);
    test.equal(input.udp.srcPort, rinfo.port);
    test.equal(buf.length, rinfo.size);
  });

  dgram.on('close', function() {
    test.done();
  });

  dgram.input.write(input);
  dgram.input.end();
};

module.exports.response = function(test) {
  test.expect(5);

  var buf = new Buffer(100);
  for (var i = 0, n = buf.length; i < n; ++i) {
    buf.writeUInt8(i & 0xff, i);
  }

  var src = '1.2.3.4';
  var srcPort = 52;
  var dst = '5.4.3.2';
  var dstPort = 123;

  var dgram = new MockDgram({address: src, port: srcPort});

  dgram.send(buf, 0, buf.length, dstPort, dst);

  var resp = dgram.output.read();

  test.deepEqual(buf, resp.data);
  test.equal(src, resp.ip.src);
  test.equal(dst, resp.ip.dst);
  test.equal(srcPort, resp.udp.srcPort);
  test.equal(dstPort, resp.udp.dstPort);

  test.done();
};
