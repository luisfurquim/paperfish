function urlencode(str) {
   //       discuss at: http://phpjs.org/functions/urlencode/
   //      original by: Philip Peterson
   //      improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
   //      improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
   //      improved by: Brett Zamir (http://brett-zamir.me)
   //      improved by: Lars Fischer
   //         input by: AJ
   //         input by: travc
   //         input by: Brett Zamir (http://brett-zamir.me)
   //         input by: Ratheous
   //      bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
   //      bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
   //      bugfixed by: Joris
   // reimplemented by: Brett Zamir (http://brett-zamir.me)
   // reimplemented by: Brett Zamir (http://brett-zamir.me)
   //             note: This reflects PHP 5.3/6.0+ behavior
   //             note: Please be aware that this function expects to encode into UTF-8 encoded strings, as found on
   //             note: pages served as UTF-8
   //        example 1: urlencode('Kevin van Zonneveld!');
   //        returns 1: 'Kevin+van+Zonneveld%21'
   //        example 2: urlencode('http://kevin.vanzonneveld.net/');
   //        returns 2: 'http%3A%2F%2Fkevin.vanzonneveld.net%2F'
   //        example 3: urlencode('http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a');
   //        returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a'

   str = (str + '').toString();

   // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
   // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
   return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A')
      .replace(/%20/g, '+');
}



function intMurmurHash3_32_gc(key, seed) {
// JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
// Last author just stripped off string handling to use 32bit integer keys
//
// @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
// @see http://github.com/garycourt/murmurhash-js
// @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
// @see http://sites.google.com/site/murmurhash/
// @author <a href="mailto:luisfurquim@gmail.com">Luis Otavio de Colla Furquim</a>
//
// @param {number} 32-bit integer
// @param {number} seed Positive integer only
// @return {number} 32-bit positive integer hash

   var h1, h1b, c1, c1b, c2, c2b, k1, i;

   h1 = seed;
   c1 = 0xcc9e2d51;
   c2 = 0x1b873593;
   i = 0;

   k1 = key;
   k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
   k1 = (k1 << 15) | (k1 >>> 17);
   k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

   h1 ^= k1;
   h1 = (h1 << 13) | (h1 >>> 19);
   h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
   h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));

   h1 ^= 4;

   h1 ^= h1 >>> 16;
   h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
   h1 ^= h1 >>> 13;
   h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
   h1 ^= h1 >>> 16;

   return h1 >>> 0;
}



(function( $ ) {

   var sleep;
   var wsconn;


   if (setTimeout) {
      sleep = function (fn,tm) {
         setTimeout(fn,tm);
      };
   } else if (chrome && chrome.alarms) {
      sleep = function (fn) {
         chrome.alarms.create("paperfish_sleep2", {delayInMinutes:tm * .00001666666667});
         chrome.alarms.onAlarm.addListener(function (al) {
            if (al.name=="paperfish_sleep2") {
               fn();
            }
         });
      };
   } else {
      throw new Error("Can't handle time");
   }

   var genKey = function(str) {
      var i, k = 0;

      for(i=0;i<str.length;i++) {
         k += i + 1277;
         k ^= str.charCodeAt(i);
         k  = ((k&0xff) << 24) | (k>>>8);
      }
      return k;
   };



   var wsconnect = function(url, failFunc) {

      console.log("Connecting wsocket ");

      wsconn = new WebSocket(url);
      wsconn.failFunc = failFunc;

      if (!wsconn) {
         return new Error("Websocket connection error");
      }

      wsconn.onopen = function(){
         if (wsconn && (wsconn.readyState==1)) {
            wsconn.active = true;
         }
      }

      wsconn.onerror = function(ev){
         console.log("websocket error:", ev);
      }

      wsconn.paperfishURL = url;

      return;
   };


   var exec = function(key,args,caller,wsocket,fn,addOrDelete) {
      args[0] = intMurmurHash3_32_gc(key,Date.now());
      if (caller.eventHandlers[args[0]] != undefined) {
         sleep(function() {
            exec(key,args,caller,wsocket,fn,addOrDelete)
         },2);
      } else {
         if (wsocket.readyState==0) {
            sleep(function() {
               exec(key,args,caller,wsocket,fn,addOrDelete)
            },2);
         } else if (wsocket.readyState==1) {
            addOrDelete(args[0],fn);
            wsocket.send(JSON.stringify(args));
            return;
         } else if (wsocket.fail) {
            if ((wsconn.paperfishRetries<32) && (!wsconnect(wsconn.paperfishURL, wsocket.failFunc))) {
               console.log("Wsocket reconnected!");
               sleep(function() {
                  exec(key,args,caller,wsocket,fn,addOrDelete)
               },2);
               setTimeout(function() {
                  wsconn.paperfishRetries = 0;
               },100);
            } else {
               console.log("Wsocket reconnection failed!");
               wsocket.fail(key,args);
               wsocket.fail = undefined;
            }
         } else if (wsocket.failFunc) {
            if ((wsconn.paperfishRetries<32) && (!wsconnect(wsconn.paperfishURL, wsocket.failFunc))) {
               console.log("Wsocket reconnected!");
               sleep(function() {
                  exec(key,args,caller,wsocket,fn,addOrDelete)
               },2);
               setTimeout(function() {
                  wsconn.paperfishRetries = 0;
               },100);
         } else {
               console.log("Wsocket reconnection failed!");
               wsocket.failFunc(key,args);
            }
         } else {
            throw new Error("Socket not ready");
         }
      }
   };

   var subOpCaller = function(wsocket, spec, evts) {
      var i, p, fld;
      var caller = {
         eventHandlers: {0:{}}
      };
      var params;
      var k;
      var func;

      for (fld in spec) {
         if (spec.hasOwnProperty(fld)) {
            params = [];
            if (spec[fld].parameters !== undefined) {
               for (p=0;p<spec[fld].parameters.length;p++) {
                  if (spec[fld].parameters[p].type=="string") {
                     params.push(function(pos,f) {
                        return function(p) {
                           if (typeof p === "string") {
                              return;
                           }
                           throw new Error("Wrong paramater type " + f + "@" + pos + ", want string, got " + (typeof p));
                        };
                     }(params.length,fld));
                  } else if (spec[fld].parameters[p].type== "number") {
                     params.push(function(pos,f) {
                        return function(p) {
                           if (typeof p === "number") {
                              return;
                           }
                           throw new Error("Wrong paramater type " + f + "@" + pos + ", want number, got " + (typeof p));
                        };
                     }(params.length,fld));
                  } else if (spec[fld].parameters[p].type== "integer") {
                     params.push(function(pos,f) {
                        return function(p) {
                           if (typeof p !== "number") {
                              throw new Error("Wrong paramater type " + f + "@" + pos + ", want integer, got " + (typeof p));
                           }
                           if (isNaN(p)) {
                              throw new Error("Wrong paramater type " + f + "@" + pos + ", want integer, got NaN");
                           }
                           if ((p|0)==p) {
                              return;
                           }
                           throw new Error("Wrong paramater type " + f + "@" + pos + ", want integer, got number");
                        };
                     }(params.length,fld));
                  } else if (spec[fld].parameters[p].type== "boolean") {
                     params.push(function(pos,f) {
                        return function(p) {
                           if (typeof p === "boolean") {
                              return;
                           }
                           throw new Error("Wrong paramater type " + f + "@" + pos + ", want boolean, got " + (typeof p));
                        };
                     }(params.length,fld));
                  } else if (spec[fld].parameters[p].type== "array") {
                     params.push(function(pos,f) {
                        return function(p) {
                           if (Array.isArray(p)) {
                              return;
                           }
                           throw new Error("Wrong paramater type " + f + "@" + pos + ", want array, got " + (typeof p));
                        };
                     }(params.length,fld));

                  } else {
                     throw new Error("Unsupported type " + fld + "@" + pos + ": " + spec[fld].parameters[p].type);
                  }
               }
            }

            k = genKey(fld);
            caller[fld] = function(CheckParms, name, key) {
               return function() {
                  var i;
                  var args = [0, name, []];
                  var fnSuccess;

                  if (CheckParms.length != (arguments.length-1)) {
                     if ((CheckParms.length == (arguments.length-2)) && (typeof arguments[arguments.length-2] == "function") && (typeof arguments[arguments.length-1] == "function")) {
                        wsocket.fail = arguments[arguments.length-1];
                        fnSuccess    = arguments[arguments.length-2];
                     } else {
                        throw new Error("Wrong parameter count: want " + (CheckParms.length+1) + ", got " + arguments.length);
                     }
                  }

                  if (typeof arguments[arguments.length-1] !== "function") {
                     throw new Error("Last parameter MUST be a callback function");
                  }

                  for(i=0;i<CheckParms.length;i++) {
                     CheckParms[i](arguments[i]);
                     args[2].push(arguments[i]);
                  }

                  if (!fnSuccess) {
                     fnSuccess = arguments[arguments.length-1];
                  }

                  exec(key,args,caller,wsocket,fnSuccess,function(k,v) {
                     caller.eventHandlers[k] = v;
                  });
               };
            }(params, fld, k);
         }
      }

      caller.on = {};
      caller.off = {};

      for (evt in evts) {
         if (evts.hasOwnProperty(evt)) {
            caller.on[evt] = function(e,key) {
               if (caller.eventHandlers[0][e] == undefined) {
                  caller.eventHandlers[0][e] = [];
               }
               return function(fn) {
                  exec(key,[0,"bind",e],caller,wsocket,fn,function(k,v) {
                     caller.eventHandlers[k] = function() {
                        caller.eventHandlers[0][e].push(v);
                     }
                  });
               };
            }(evt,genKey(evt));
            caller.off[evt] = function(e,key) {
               return function(fn) {
                  exec(key,[0,"unbind",e],caller,wsocket,fn,function(k,v) {
                     caller.eventHandlers[k] = function() {
                        var i;
                        for(i=0;i<caller.eventHandlers[0][e].length;i++) {
                           if (caller.eventHandlers[0][e][i] == fn) {
                              caller.eventHandlers[0][e].splice(i, 1);
                              break;
                           }
                        }
                     }
                  });
               };
            }(evt,genKey(evt));
         }
      }

      return caller;
   }

   var schemes = {
      "-":     0,
      "http":  1,
      "https": 2,
      "ws":    3,
      "wss":   4
   }

   if ($==undefined) {
      alert("jQuery not found! Paperfish was disabled.");
      return;
   }

   $.paperfish = function(options) {
      var url, xhr, pk;
      var conn = {readyState: "wait"}; // The readyState is initially set to 'wait' to make an async call to ajax

      if (options.done != undefined) {
         if (typeof(options.done)!="function") {
            var err = "Option 'done', if provided, must be a function callback to be called in case of a success ajax call";
            return {
               readyState: "failed",
               textStatus: err,
               error:      new Error(err)
            };
         }
      }

      if (options.fail != undefined) {
         if (typeof(options.fail)!="function") {
            var err = "Option 'fail', if provided, must be a function callback to be called in case of a failed ajax call";
            return {
               readyState: "failed",
               textStatus: err,
               error:      new Error(err)
            };
         }
      }

      if (options.url==undefined) {
         return {
            readyState: "failed",
            textStatus: "Option 'url' must be a url to the web service definition (swagger or wsdl)",
            error:      new Error("Option 'url' must be a url to the web service definition (swagger or wsdl)")
         };
      }

      if ((options.pk!==undefined) && (typeof options.pk.sign !== "function")) {
         console.error("options.pk");
         return {
            readyState: "failed",
            textStatus: "Option 'pk' must have a sign method",
            error:      new Error("Option 'pk' must have a sign method")
         };
      }


      // All web service client definitions will be guided by the swagger.json specifications
      $.ajax({
         xhr: xhr,
         method: "GET",
         url: options.url,
         dataType: "json"
      }).done(function(swagger, textStatus, jqXHR) {
         var i, path, qparms, def, defs, name, type;
         var methods = ["get", "post", "put", "delete", "patch", "head"];
         var prepare;

         url = options.url.substr(options.url.indexOf("://"));
         if (url.substr(url.length-1) != "/") {
            url += "/";
         }

         for(path in swagger.paths) {
            if (swagger.paths.hasOwnProperty(path)) {
               for(i=0;i<methods.length;i++) {
                  // Test if this operation defined this HTTP method
                  if (swagger.paths[path][methods[i]]) {
                     if (conn[swagger.paths[path][methods[i]].operationId]==undefined) {
                        conn[swagger.paths[path][methods[i]].operationId] = {url:{}};
                     }
                     // Create the client for this operation ID
                     prepare = function(pathTemplate,method,encode,dataType,defines) {
                        var j;
                        var sortedParms, sig, err;

                        if (options.pk !== undefined) {
                           sortedParms = [];

                           if (defines.parameters !== undefined) {
                              for(j=0;j<defines.parameters.length;j++) {
                                 sortedParms.push(defines.parameters[j].name);
                              }

                              sortedParms.sort();
                           }
                        }

                        return function(parmobj, doneFunc, failFunc, progress) {
                           var j, k, queryparms="?", headers={}, bodyData, socket;
                           var path = pathTemplate;
                           var req, url, urlPath, xhr;
                           var msgToSign;

                           // Check the operation ID parameter definitions
                           if (defines.parameters !== undefined) {
                              for(j=0;j<defines.parameters.length;j++) {
                                 if (parmobj[defines.parameters[j].name]==undefined) {
                                    if (defines.parameters[j].required) {
                                       throw new Error("Parameter " + defines.parameters[j].name + " is required");
                                    }
                                    continue;
                                 }

                                 // First we check the input parameters to create the operation client

                                 // The parameters may be defined to be sent in various places like the query part
                                 // of the URL, URL path parts, HTTP headers or the body. So, we have to check to
                                 // encode them in the places where the server expects them.
                                 if (defines.parameters[j].in == "query") {
                                    if (defines.parameters[j]["x-collectionFormat"]=="cskv") {
                                       queryparms += defines.parameters[j].name + "=";
                                       for(k in parmobj[defines.parameters[j].name]) {
                                          if (parmobj[defines.parameters[j].name].hasOwnProperty(k)) {
                                             queryparms += k + ":" + urlencode(parmobj[defines.parameters[j].name][k]) + ",";
                                          }
                                       }
                                       queryparms =  queryparms.substr(0,queryparms.length-1) + "&";
                                    } else if (defines.parameters[j].type == "array") {
                                       queryparms += defines.parameters[j].name + "=";
                                       for(k=0;k<parmobj[defines.parameters[j].name].length;k++) {
                                          queryparms += urlencode(parmobj[defines.parameters[j].name][k]) + ",";
                                       }
                                       queryparms =  queryparms.substr(0,queryparms.length-1) + "&";
                                    } else {
                                       queryparms += defines.parameters[j].name + "=" + urlencode(parmobj[defines.parameters[j].name]) + "&";
                                    }
                                 } else  if (defines.parameters[j].in == "header") {
                                    headers[defines.parameters[j].name] = parmobj[defines.parameters[j].name];
                                 } else  if (defines.parameters[j].in == "path") {
                                    path = path.replace("{" + defines.parameters[j].name + "}", urlencode(parmobj[defines.parameters[j].name]));
                                 } else  if (defines.parameters[j].in == "formData") {
                                    if (encode=="multipart/form-data") {
                                       if (bodyData==undefined) {
                                          bodyData = new FormData();
                                       }
                                       bodyData.append(defines.parameters[j].name,parmobj[defines.parameters[j].name]);
                                    } else if (encode=="application/x-www-form-urlencoded") {
                                       if (bodyData==undefined) {
                                          bodyData = "";
                                       }
                                       bodyData += defines.parameters[j].name + "=" + urlencode(parmobj[defines.parameters[j].name]) + "&";
                                    }
                                 } else  if (defines.parameters[j].in == "body") {
                                    if (encode=="multipart/form-data") {
                                       if (bodyData==undefined) {
                                          bodyData = new FormData();
                                       }
                                       if (parmobj[defines.parameters[j].name].constructor === Array) {
                                          for(k=0;k<parmobj[defines.parameters[j].name].length;k++) {
                                             bodyData.append(defines.parameters[j].name + "[" + k + "]",parmobj[defines.parameters[j].name][k]);
                                          }
                                       } else {
                                          bodyData.append(defines.parameters[j].name,parmobj[defines.parameters[j].name]);
                                       }
                                    } else if (encode=="application/x-www-form-urlencoded") {
                                       bodyData = defines.parameters[j].name + "=" + urlencode(parmobj[defines.parameters[j].name]) + "&";
                                    } else if (encode=="application/json") {
                                       if (bodyData==undefined) {
                                          bodyData = "";
                                       }
                                       bodyData += JSON.stringify(parmobj[defines.parameters[j].name]) + "\n";
                                    } else if (encode=="application/octet-stream") {
                                       bodyData = parmobj[defines.parameters[j].name];
                                    } else if (encode=="application/octet-stream;base64") {
                                       bodyData = btoa(parmobj[defines.parameters[j].name]);
                                    } else if (encode=="application/xml") {
                                       throw new Error("No XML marshaling support yet");
                                    }
                                 }
                              }
                           }

                           url = "-";
                           for(j=0;j<defines.schemes.length;j++) {
                              if (schemes[defines.schemes[j]]>schemes[url]) {
                                 url = defines.schemes[j];
                                 if (url=="wss") {
                                    break;
                                 }
                              }
                           }

                           url += "://" + swagger.host + "/"; //schemes
                           urlPath = "/";

                           if (swagger.basePath.substr(0,1) == "/") {
                              url += swagger.basePath.substr(1);
                              urlPath += swagger.basePath.substr(1);
                           } else {
                              url += swagger.basePath;
                              urlPath += swagger.basePath;
                           }

                           if (url.substr(url.length-1) != "/") {
                              url += "/";
                              urlPath += "/";
                           }

                           if (path.substr(0,1) == "/") {
                              url += path.substr(1);
                              urlPath += path.substr(1);
                           } else {
                              url += path;
                              urlPath += path;
                           }

                           if (queryparms != "?") {
                              url += queryparms;
                              urlPath += queryparms;
                           }

                           if (dataType=="application/json") {
                              dataType = "json";
                           } else if (dataType=="application/xml") {
                              dataType = "xml";
                           }

                           if ((url.substr(0,4)=="wss:") || (url.substr(0,3)=="ws:")) {
                              if(!("WebSocket" in window)) {
                                 throw new Error("You need a browser that supports WebSockets");
                              }

                              wsconnect(url, failFunc);

                              socket = subOpCaller(wsconn,defines["x-websocketoperations"],defines["x-websocketevents"]);

                              socket.close = function(){
                                 wsconn.close();
                              };

                              socket.dump = function(){
                                 console.log("wsock dump:",wsconn);
                              };

                              // Handles messages from server
                              wsconn.onmessage = function(msg){
                                 var i;
                                 var hnd;
                                 var response;

                                 response = JSON.parse(msg.data);

                                 if ((!response) || (response.length < 2) || (response.length > 3)) {
                                    throw new Error("Websocket syntax error");
                                 }

                                 hnd = socket.eventHandlers[response[0]];
                                 if (hnd != undefined) {
                                    if ((response[0]==0) && hnd) {
                                       hnd = hnd[response[1]];
                                       // server events
                                       for(i=0;i<hnd.length;i++) {
                                          if (response.length==2) {
                                             hnd[i]();
                                          } else if (response.length>2) {
                                             hnd[i](response[2]);
                                          }
                                       }
                                    } else {
                                       // server responses to client initiated requests
                                       if (response.length==2) {
                                          hnd(response[1]);
                                       } else if (response.length>2) {
                                          hnd(response[1],response[2]);
                                       }
                                       delete(socket.eventHandlers[response[0]]);
                                    }

                                 }
                              }

                              return socket;

                           } else {
                              if (progress !== undefined) {
                                 xhr = function() {
                                    var xhr = new XMLHttpRequest();
                                    if (progress.upload!==undefined) {
                                       if (typeof(progress.upload)!="function") {
                                          return {
                                             readyState: "failed",
                                             textStatus: "Option 'progress.upload', if provided, must be a function callback to be called on upload progress",
                                             error:      new Error("Option 'progress.upload', if provided, must be a function callback to be called on upload progress")
                                          };
                                       }
                                       // Upload progress
                                       xhr.upload.addEventListener("progress", function(evt){
                                          if (evt.lengthComputable) {
                                             progress.upload(evt.loaded / evt.total);
                                          }
                                       }, false);
                                    }

                                    if (progress.download!==undefined) {
                                       console.log("progress defined");
                                       if (typeof(progress.download)!="function") {
                                          return {
                                             readyState: "failed",
                                             textStatus: "Option 'progress.download', if provided, must be a function callback to be called on download progress",
                                             error:      new Error("Option 'progress.download', if provided, must be a function callback to be called on download progress")
                                          };
                                       }
                                       // Download progress
                                       xhr.addEventListener("progress", function(evt){
                                          console.log("progress 1");
                                          if (evt.lengthComputable) {
                                             console.log("progress 2");
                                             if (evt.lengthComputable) {
                                                console.log("progress 3");
                                                progress.download(evt.loaded / evt.total);
                                             }
                                         }
                                       }, false);
                                    }
                                    return xhr;
                                 }
                              }

                              req = {
                                 xhr: xhr,
                                 method: method,
                                 url: url,
                                 dataType: dataType,
                                 headers: headers,
                                 processData: false
                              };
                              if (typeof bodyData != 'undefined') {
                                 req.mimeType    = encode;
                                 req.contentType = false;
                                 req.data        = bodyData;
                              }

                              if (options.pk !== undefined) {
                                 msgToSign = method.toUpperCase() + "+" + urlPath;
                                 console.error("url", urlPath);
                                 if (req.data !== undefined) {
                                    msgToSign += "\n" + req.data;
                                 }

                                 console.log("will sign on [" + msgToSign + "]");
                                 [sig, err] = options.pk.sign(msgToSign);
                                 if (err == null) {
                                    req.headers["X-Request-Signature"] = sig;
                                    req.headers["X-Request-Signer"] = options.pk.keyId;
                                 } else {
                                    console.error("Error signing paperfish request", err);
                                 }
                              }

                              return req;
                           }
                        };
                     }(path, methods[i], swagger.paths[path][methods[i]].consumes[0], swagger.paths[path][methods[i]].produces[0], swagger.paths[path][methods[i]]);

                     conn[swagger.paths[path][methods[i]].operationId][methods[i]] = function(prep) {
                        return function(parmobj, doneFunc, failFunc, progress) {
                           var reqSocket;

                           reqSocket = prep(parmobj, doneFunc, failFunc, progress);

                           if ((reqSocket.url.substr(0,4)=="wss:") || (reqSocket.url.substr(0,3)=="ws:")) {
                              return reqSocket;
                           }

                           $.ajax(reqSocket)
                              .done(doneFunc || function(){})
                              .fail(failFunc || function(){});

                           return parmobj;
                        }
                     }(prepare);

                     conn[swagger.paths[path][methods[i]].operationId].url[methods[i]] = function(prep) {
                        return function(parmobj, doneFunc, failFunc, progress) {
                           return prep(parmobj, doneFunc, failFunc, progress).url;
                        };
                     }(prepare);

                     // Secondly we check the input parameter names to create the operation documentation

                     qparms = {};
                     if (swagger.paths[path][methods[i]].parameters) {
                        defs = swagger.paths[path][methods[i]].parameters
                        for(j=0;j<defs.length;j++) {
                           def  = defs[j];
                           name = def.name
                           if (def.required) {
                              name = "*" + name;
                           }
                           if (def["x-collectionFormat"]=="cskv") {
                              type = "[" + def["x-keytype"] + "]"  + def.items.type;
                           } else if (def.type == "array") {
                              type = "[]" + def.schema.items.type;
                           } else {
                              if (def.type) {
                                 type = def.type;
                              } else {
                                 type = "string";
                              }
                           }
                           qparms[name] = {
                              description: def.description,
                              type: type
                           };
                        }
                     }

                     conn[swagger.paths[path][methods[i]].operationId][methods[i]].doc = qparms;
                  }
               }
            }
         }

         conn.readyState = "done";
         conn.textStatus = textStatus;
         conn.jqXHR      = jqXHR;

         if (options.done!=undefined) {
            options.done.call(conn);
         }
      }).fail(function(jqXHR, textStatus, errorThrown) {
         conn.readyState = "failed";
         conn.jqXHR      = jqXHR;
         conn.textStatus = textStatus;
         conn.error      = errorThrown;

         if (options.fail!=undefined) {
            options.fail.call(conn);
         }
      });

      return conn;
   };


}( jQuery ));
