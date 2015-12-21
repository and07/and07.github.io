var basketModule = (function () {
 
  // privates
 
  var basket = [];
 
  function doSomethingPrivate() {
    //...
  }
 
  function doSomethingElsePrivate() {
    //...
  }
 
  // Return an object exposed to the public
  return {
 
    // Add items to our basket
    addItem: function( values ) {
      basket.push(values);
    },
 
    // Get the count of items in the basket
    getItemCount: function () {
      return basket.length;
    },
 
    // Public alias to a  private function
    doSomething: doSomethingPrivate,
 
    // Get the total value of items in the basket
    getTotal: function () {
 
      var q = this.getItemCount(),
          p = 0;
 
      while (q--) {
        p += basket[q].price;
      }
 
      return p;
    },
    onSetName: function(){
        alert('setName');
    }
  };
})();



var RevealingModule = (function () {
 
        var privateVar = "Ben Cherry",
            publicVar  = "Hey there!";
 
        function privateFunction() {
            console.log( "Name:" + privateVar );
        }
 
        function publicSetName( strName ) {
            privateVar = strName;
            alert('setName :'+privateVar);
        }
 
        function publicGetName() {
            privateFunction();
        }
 
 
        // Reveal public pointers to
        // private functions and properties
 
        return {
            onSetName: publicSetName,
            greeting: publicVar,
            getName: publicGetName
        };
 
})();
