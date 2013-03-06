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

module.exports = MockDgram;

var EventEmitter = require('events').EventEmitter;
var IpHeader = require('ip-header');
var UdpHeader = require('udp-header');
var PassThrough = require('stream').PassThrough;
if (!PassThrough) {
  PassThrough = require('readable-stream/passthrough');
}
var util = require('util');

util.inherits(MockDgram, EventEmitter);

var DEFAULT_IP = '0.0.0.0';

function MockDgram(opts) {
  var self = (this instanceof MockDgram)
           ? this
           : Object.create(MockDgram.prototype);

  opts = opts || {};

  EventEmitter.call(self, opts);

  self.input = new PassThrough({objectMode: true});
  self.input.on('end', function() { self._doEnd() });
  self.input.on('error', self.emit.bind(self, 'error'));

  self.output = new PassThrough({objectMode: true});
  self.output.on('end', function() { self._doEnd() });
  self.output.on('error', self.emit.bind(self, 'error'));

  self._paused = !!opts.paused;
  self._address = opts.address || DEFAULT_IP;
  self._port = ~~opts.port;
  self._defaultSrc = opts.defaultSrc || DEFAULT_IP;
  self._defaultSrcPort = ~~opts.defaultSrcPort;

  if (!self._paused) {
    process.nextTick(self._doRead.bind(this));
  }

  return self;
}

MockDgram.prototype.pause = function() {
  this._paused = true;
};

MockDgram.prototype.resume = function() {
  if (this._paused) {
    this._paused = false;
    process.nextTick(this._doRead.bind(this));
  }
};

MockDgram.prototype.send = function(buf, offset, length, port, address, cb) {
  var msg = {
    data: buf.slice(offset, length),
    ip: new IpHeader({
      src: this._address,
      dst: address,
      protocol: 'udp'
    }),
    udp: new UdpHeader({
      srcPort: this._port,
      dstPort: port,
      dataLength: length
    })
  };

  // No good way to handle back-pressure here unfortunately.
  this.output.write(msg, null, cb);
};

MockDgram.prototype.close = function() {
  this._doEnd();
};

MockDgram.prototype.address = function() {
  return { address: this._address, port: this._port, family: 'IPv4' };
};

MockDgram.prototype._doRead = function() {
  if (this._paused) {
    return;
  }

  var msg = this.input.read();
  if (!msg) {
    this.input.once('readable', this._doRead.bind(this));
    return;
  }

  this._onData(msg);

  return this._doRead();
};

MockDgram.prototype._onData = function(msg) {
  if (Buffer.isBuffer(msg)) {
    msg = { data: msg };
  }

  msg.ip = msg.ip || {};
  msg.ip.src = msg.ip.src || this._defaultSrc;

  msg.udp = msg.udp || {};
  msg.udp.srcPort = typeof msg.udp.srcPort === 'number'
                  ? msg.udp.srcPort : this._defaultSrcPort;
  msg.udp.dataLength = (msg.data && msg.data.length) ? msg.data.length : 0;

  msg.offset = ~~msg.offset;

  // auto-configure destination IP address if not already set
  if (this._address === DEFAULT_IP && msg.ip.dst) {
    this._address = msg.ip.dst;
  }

  // auto-configure destination UDP port if not already set
  if (!this._port && msg.udp.dstPort) {
    this._port = msg.udp.dstPort;
  }

  var rinfo = {
    address: msg.ip.src,
    port: msg.udp.srcPort,
    size: msg.udp.dataLength
  };

  this.emit('message', msg.data, rinfo);
};

MockDgram.prototype._doEnd = function() {
  this._doEnd = function() {};
  this._onData = function() {};
  this.send = function() { throw new Error('Not running'); };

  this.input.end();
  this.output.end();

  this.emit('close');
};

// Compatibility stubs
MockDgram.prototype.bind = function(port, address) {};
MockDgram.prototype.setBroadcast = function(flag) {};
MockDgram.prototype.setTTL = function(ttl) {};
MockDgram.prototype.setMulticastTTL = function(ttl) {};
MockDgram.prototype.setMulticastLoopback = function(flag) {};
MockDgram.prototype.addMembership = function(mcAddress, mcInterface) {};
MockDgram.prototype.dropMembership = function(mcAddress, mcInterface) {};
MockDgram.prototype.unref = function() {};
MockDgram.prototype.ref = function() {};
