(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.Comlink = {}));
}(this, (function (exports) { 'use strict';

  /**
   * Copyright 2019 Google Inc. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *     http://www.apache.org/licenses/LICENSE-2.0
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const proxyMarker = Symbol("Comlink.proxy");
  const createEndpoint = Symbol("Comlink.endpoint");
  const releaseProxy = Symbol("Comlink.releaseProxy");
  const throwMarker = Symbol("Comlink.thrown");
  const isObject = (val) => (typeof val === "object" && val !== null) || typeof val === "function";
  /**
   * Internal transfer handle to handle objects marked to proxy.
   */
  const proxyTransferHandler = {
      canHandle: (val) => isObject(val) && val[proxyMarker],
      serialize(obj) {
          const { port1, port2 } = new MessageChannel();
          expose(obj, port1);
          return [port2, [port2]];
      },
      deserialize(port) {
          port.start();
          return wrap(port);
      },
  };
  /**
   * Internal transfer handler to handle thrown exceptions.
   */
  const throwTransferHandler = {
      canHandle: (value) => isObject(value) && throwMarker in value,
      serialize({ value }) {
          let serialized;
          if (value instanceof Error) {
              serialized = {
                  isError: true,
                  value: {
                      message: value.message,
                      name: value.name,
                      stack: value.stack,
                  },
              };
          }
          else {
              serialized = { isError: false, value };
          }
          return [serialized, []];
      },
      deserialize(serialized) {
          if (serialized.isError) {
              throw Object.assign(new Error(serialized.value.message), serialized.value);
          }
          throw serialized.value;
      },
  };
  /**
   * Allows customizing the serialization of certain values.
   */
  const transferHandlers = new Map([
      ["proxy", proxyTransferHandler],
      ["throw", throwTransferHandler],
  ]);
  function expose(obj, ep = self) {
      ep.addEventListener("message", function callback(ev) {
          if (!ev || !ev.data) {
              return;
          }
          const { id, type, path } = Object.assign({ path: [] }, ev.data);
          const argumentList = (ev.data.argumentList || []).map(fromWireValue);
          let returnValue;
          try {
              const parent = path.slice(0, -1).reduce((obj, prop) => obj[prop], obj);
              const rawValue = path.reduce((obj, prop) => obj[prop], obj);
              switch (type) {
                  case "GET" /* GET */:
                      {
                          returnValue = rawValue;
                      }
                      break;
                  case "SET" /* SET */:
                      {
                          parent[path.slice(-1)[0]] = fromWireValue(ev.data.value);
                          returnValue = true;
                      }
                      break;
                  case "APPLY" /* APPLY */:
                      {
                          returnValue = rawValue.apply(parent, argumentList);
                      }
                      break;
                  case "CONSTRUCT" /* CONSTRUCT */:
                      {
                          const value = new rawValue(...argumentList);
                          returnValue = proxy(value);
                      }
                      break;
                  case "ENDPOINT" /* ENDPOINT */:
                      {
                          const { port1, port2 } = new MessageChannel();
                          expose(obj, port2);
                          returnValue = transfer(port1, [port1]);
                      }
                      break;
                  case "RELEASE" /* RELEASE */:
                      {
                          returnValue = undefined;
                      }
                      break;
                  default:
                      return;
              }
          }
          catch (value) {
              returnValue = { value, [throwMarker]: 0 };
          }
          Promise.resolve(returnValue)
              .catch((value) => {
              return { value, [throwMarker]: 0 };
          })
              .then((returnValue) => {
              const [wireValue, transferables] = toWireValue(returnValue);
              ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);
              if (type === "RELEASE" /* RELEASE */) {
                  // detach and deactive after sending release response above.
                  ep.removeEventListener("message", callback);
                  closeEndPoint(ep);
              }
          });
      });
      if (ep.start) {
          ep.start();
      }
  }
  function isMessagePort(endpoint) {
      return endpoint.constructor.name === "MessagePort";
  }
  function closeEndPoint(endpoint) {
      if (isMessagePort(endpoint))
          endpoint.close();
  }
  function wrap(ep, target) {
      return createProxy(ep, [], target);
  }
  function throwIfProxyReleased(isReleased) {
      if (isReleased) {
          throw new Error("Proxy has been released and is not useable");
      }
  }
  function createProxy(ep, path = [], target = function () { }) {
      let isProxyReleased = false;
      const proxy = new Proxy(target, {
          get(_target, prop) {
              throwIfProxyReleased(isProxyReleased);
              if (prop === releaseProxy) {
                  return () => {
                      return requestResponseMessage(ep, {
                          type: "RELEASE" /* RELEASE */,
                          path: path.map((p) => p.toString()),
                      }).then(() => {
                          closeEndPoint(ep);
                          isProxyReleased = true;
                      });
                  };
              }
              if (prop === "then") {
                  if (path.length === 0) {
                      return { then: () => proxy };
                  }
                  const r = requestResponseMessage(ep, {
                      type: "GET" /* GET */,
                      path: path.map((p) => p.toString()),
                  }).then(fromWireValue);
                  return r.then.bind(r);
              }
              return createProxy(ep, [...path, prop]);
          },
          set(_target, prop, rawValue) {
              throwIfProxyReleased(isProxyReleased);
              // FIXME: ES6 Proxy Handler `set` methods are supposed to return a
              // boolean. To show good will, we return true asynchronously ¯\_(ツ)_/¯
              const [value, transferables] = toWireValue(rawValue);
              return requestResponseMessage(ep, {
                  type: "SET" /* SET */,
                  path: [...path, prop].map((p) => p.toString()),
                  value,
              }, transferables).then(fromWireValue);
          },
          apply(_target, _thisArg, rawArgumentList) {
              throwIfProxyReleased(isProxyReleased);
              const last = path[path.length - 1];
              if (last === createEndpoint) {
                  return requestResponseMessage(ep, {
                      type: "ENDPOINT" /* ENDPOINT */,
                  }).then(fromWireValue);
              }
              // We just pretend that `bind()` didn’t happen.
              if (last === "bind") {
                  return createProxy(ep, path.slice(0, -1));
              }
              const [argumentList, transferables] = processArguments(rawArgumentList);
              return requestResponseMessage(ep, {
                  type: "APPLY" /* APPLY */,
                  path: path.map((p) => p.toString()),
                  argumentList,
              }, transferables).then(fromWireValue);
          },
          construct(_target, rawArgumentList) {
              throwIfProxyReleased(isProxyReleased);
              const [argumentList, transferables] = processArguments(rawArgumentList);
              return requestResponseMessage(ep, {
                  type: "CONSTRUCT" /* CONSTRUCT */,
                  path: path.map((p) => p.toString()),
                  argumentList,
              }, transferables).then(fromWireValue);
          },
      });
      return proxy;
  }
  function myFlat(arr) {
      return Array.prototype.concat.apply([], arr);
  }
  function processArguments(argumentList) {
      const processed = argumentList.map(toWireValue);
      return [processed.map((v) => v[0]), myFlat(processed.map((v) => v[1]))];
  }
  const transferCache = new WeakMap();
  function transfer(obj, transfers) {
      transferCache.set(obj, transfers);
      return obj;
  }
  function proxy(obj) {
      return Object.assign(obj, { [proxyMarker]: true });
  }
  function windowEndpoint(w, context = self, targetOrigin = "*") {
      return {
          postMessage: (msg, transferables) => w.postMessage(msg, targetOrigin, transferables),
          addEventListener: context.addEventListener.bind(context),
          removeEventListener: context.removeEventListener.bind(context),
      };
  }
  function toWireValue(value) {
      for (const [name, handler] of transferHandlers) {
          if (handler.canHandle(value)) {
              const [serializedValue, transferables] = handler.serialize(value);
              return [
                  {
                      type: "HANDLER" /* HANDLER */,
                      name,
                      value: serializedValue,
                  },
                  transferables,
              ];
          }
      }
      return [
          {
              type: "RAW" /* RAW */,
              value,
          },
          transferCache.get(value) || [],
      ];
  }
  function fromWireValue(value) {
      switch (value.type) {
          case "HANDLER" /* HANDLER */:
              return transferHandlers.get(value.name).deserialize(value.value);
          case "RAW" /* RAW */:
              return value.value;
      }
  }
  function requestResponseMessage(ep, msg, transfers) {
      return new Promise((resolve) => {
          const id = generateUUID();
          ep.addEventListener("message", function l(ev) {
              if (!ev.data || !ev.data.id || ev.data.id !== id) {
                  return;
              }
              ep.removeEventListener("message", l);
              resolve(ev.data);
          });
          if (ep.start) {
              ep.start();
          }
          ep.postMessage(Object.assign({ id }, msg), transfers);
      });
  }
  function generateUUID() {
      return new Array(4)
          .fill(0)
          .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
          .join("-");
  }

  exports.createEndpoint = createEndpoint;
  exports.expose = expose;
  exports.proxy = proxy;
  exports.proxyMarker = proxyMarker;
  exports.releaseProxy = releaseProxy;
  exports.transfer = transfer;
  exports.transferHandlers = transferHandlers;
  exports.windowEndpoint = windowEndpoint;
  exports.wrap = wrap;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=comlink.js.map