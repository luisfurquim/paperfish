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

(function( $ ) {

   if ($==undefined) {
      alert("jQuery not found! Paperfish was disabled.");
      return;
   }

   $.paperfish = function(options) {
      var url;
      var conn = {readyState: "wait"}; // The readyState is initially set to 'wait' to make an async call to ajax
/*
      var settings = $.extend({
         // These are the defaults.
         color: "#556b2f",
         backgroundColor: "white"
      }, options );
*/
      if (options.url==undefined) {
         return undefined;
      }

      url = options.url;
      if (url.substr(url.length-1) != "/") {
         url += "/";
      }

      // All web service client definitions will be guided by the swagger.json specifications
      $.ajax({
         method: "GET",
         url: url + "swagger.json",
         dataType: "json"
      }).done(function(swagger) {
         var i, path, qparms, def, defs, name, type;
         var methods = ["get", "post", "put", "delete", "patch"];

         for(path in swagger.paths) {
            if (swagger.paths.hasOwnProperty(path)) {
               for(i=0;i<methods.length;i++) {
                  // Test if this operation defined this HTTP method
                  if (swagger.paths[path][methods[i]]) {
                     if (conn[swagger.paths[path][methods[i]].operationId]==undefined) {
                        conn[swagger.paths[path][methods[i]].operationId] = {};
                     }
                     // Create the client for this operation ID
                     conn[swagger.paths[path][methods[i]].operationId][methods[i]] = function(pathTemplate,method,encode,dataType,defines) {
                        return function(parmobj, doneFunc, failFunc) {
                           var j, k, queryparms="?", headers={}, bodyData;
                           var path = pathTemplate;
                           var req, url;

                           // Check the operation ID parameter definitions
                           if (defines.parameters) {
                              for(j=0;j<defines.parameters.length;j++) {
                                 if (parmobj[defines.parameters[j].name]==undefined) {
                                    if (defines.parameters[j].required) {
                                       throw "Parameter " + defines.parameters[j].name + " is required";
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
                                       bodyData = new FormData();
                                       bodyData.append(defines.parameters[j].name,parmobj[defines.parameters[j].name]);
                                    } else if (encode=="application/x-www-form-urlencoded") {
                                       bodyData = defines.parameters[j].name + "=" + urlencode(parmobj[defines.parameters[j].name]) + "&";
                                    } else if (encode=="application/json") {
                                       bodyData = JSON.stringify(parmobj[defines.parameters[j].name]);
                                    } else if (encode=="application/xml") {
                                       throw "No XML marshaling support yet";
                                    }
                                 }
                              }
                           }


                           url = options.url
                           if (url.substr(url.length-1) != "/") {
                              url += "/";
                           }

                           if (swagger.basePath.substr(0,1) == "/") {
                              url += swagger.basePath.substr(1);
                           } else {
                              url += swagger.basePath;
                           }

                           if (url.substr(url.length-1) != "/") {
                              url += "/";
                           }

                           if (path.substr(0,1) == "/") {
                              url += path.substr(1);
                           } else {
                              url += path;
                           }

                           if (queryparms != "?") {
                              url += queryparms;
                           }

                           if (dataType=="application/json") {
                              dataType = "json";
                           } else if (dataType=="application/xml") {
                              dataType = "xml";
                           }

                           req = {
                              method: method,
                              url: url,
                              dataType: dataType,
                              headers: headers,
                              processData: false
                           };
                           if (typeof bodyData != 'undefined') {
                              req.mimeType = encode;
                              req.data     = bodyData;
                           }

                           $.ajax(req)
                              .done(doneFunc || function(){})
                              .fail(failFunc || function(){});

                           return parmobj;
                        };
                     }(path, methods[i], swagger.paths[path][methods[i]].consumes[0], swagger.paths[path][methods[i]].produces[0], swagger.paths[path][methods[i]]);

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
                              type = "[]" + def.items.type;
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
      }).fail(function() {
         conn = {readyState: "failed"};
      });

      return conn;
   };


}( jQuery ));
