var Clock = {
    totalSeconds: 0,
    start: function () {
        if (!this.interval) {
          var self = this;
          function pad(val) { return val > 9 ? val : "0" + val; }
          this.interval = setInterval(function () {
            self.totalSeconds += 1;
  
  
            document.querySelector("#min").innerText = (pad(Math.floor(self.totalSeconds / 60 % 60)));
            document.querySelector("#sec").innerText = (pad(parseInt(self.totalSeconds % 60)));
          }, 1000);
        }
    },
    
    reset: function () {
        Clock.totalSeconds = null; 
      clearInterval(this.interval);
      document.querySelector("#min").innerText = ("00");
      document.querySelector("#sec").innerText = ("00");
      delete this.interval;
    },
    pause: function () {
      clearInterval(this.interval);
      delete this.interval;
    },
  
    resume: function () {
      this.start();
    },
    
    restart: function () {
         this.reset();
       Clock.start();
    }
  };
  
  
  document.querySelector('#startButton').addEventListener("click", (e) =>  { Clock.start(); });
  document.querySelector('#pauseButton').addEventListener("click", (e) =>  { Clock.pause(); });
  document.querySelector('#resumeButton').addEventListener("click", (e) =>  { Clock.resume(); });
  document.querySelector('#resetButton').addEventListener("click", (e) =>  { Clock.reset(); });
  document.querySelector('#restartButton').addEventListener("click", (e) =>  { Clock.restart(); });
  