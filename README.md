# paperfish
RESTful Javascript client

## Dependencies

jQuery >= 1.9.0

## History

Paperfish was designed to work with [StoneLizard](https://github.com/luisfurquim/stonelizard "StoneLizard's Project Homepage").
But it is not attached to it and may be used with other technology enabled web services. Any incompatibilities may be caused by
its early development stage, not by any StoneLizard's peculiarity.

## Status

Currently paperfish handles web services defined by [swagger.json](http://swagger.io/specification "Swagger's Homepage")
basic definition. Complex/advanced swagger files may be incorrectly handled, please test before using it in production.
WSDL support may come in the future.

## Examples

Suppose the web service you want to use have a swagger specification at https://myws.url/swagger.json,
an operation called 'search' which can be called using the HTTP method get that acceps two parameters. The
'searchBy' parameter accepts key-value pairs defining the search arguments and the 'searchFor' argument
tells the service which fields you want to fetch from the search result. So, you could call the service
like the example below:


```Javascript

   $.paperfish({
      url: "https://myws.url/",
      done: function() {
         this.Search.get(
            {
               searchBy: {
                  name: "John"
               },
               searchFor: [
                  "address", "birthday"
               ],
            },
            function( data, textStatus, jqXHR ) {
               if ( console && console.log ) {
                  console.log( data );
               }
            },
            function( jqXHR, textStatus, errorThrown ) {
               if ( console && console.log ) {
                  console.log( errorThrown );
               }
            }
         );
      }
   }


```

