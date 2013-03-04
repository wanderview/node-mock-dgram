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
var PassThrough = require('stream').PassThrough;
if (!PassThrough) {
  PassThrough = require('readable-stream/passthrough');
}
var util = require('util');

util.inherits(MockDgram, EventEmitter);

function MockDgram(opts) {
  var self = (this instanceof MockDgram)
           ? this
           : Object.create(MockDgram.prototype);

  opts = opts || {};

  EventEmitter.call(self, opts);

  self.input = new PassThrough({objectMode: true});
  self.output = new PassThrough({objectMode: true});

  return self;
}

MockDgram.prototype.pause = function() {
  // TODO: implement pause
};

MockDgram.prototype.resume = function() {
  // TODO: implement resume
};

MockDgram.prototype.send = function(buf, offset, length, port, address, cb) {
  // TODO: implement send
};

MockDgram.prototype.close = function() {
  // TODO: implement close
};

MockDgram.prototype.address = function() {
  // TODO: implement address
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
