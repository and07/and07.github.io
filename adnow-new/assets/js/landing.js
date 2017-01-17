'use strict';

$(function () {

  var LogoSlider = function ($containers) {
    var i = 1;
    var playing = null;

    var loadLogos = function (container) {
      if (container.data('loaded')) { return; }

      container.find('.logo').each(function () {
        $(this).addClass($(this).data('logo'));
      });

      container.data('loaded', true);
    };

    this.play = function () {
      if (playing) { return; }

      playing = setInterval(function () {
        $containers.eq(0).css('margin-left', (100 * -i) + '%');
        i++;
        loadLogos($containers.eq(i));

        if (i > $containers.length + 1) {
          $containers.eq(0)
            .addClass('unanimate')
            .css('margin-left', 0);

          setTimeout(function () {
            $containers.eq(0)
              .removeClass('unanimate');

            $containers.eq(0).css('margin-left', '-100%');
            i = 2;
          }, 500);
        }
      }, 5000);
    };

    this.pause = function () {
      clearInterval(playing);
      playing = null;
    };

    loadLogos($containers.eq(0));
    loadLogos($containers.eq(1));
    $containers.eq(0).clone().appendTo($containers.parent());
  };

  var logosSlider = new LogoSlider($('.slider-container'));
  var menu = $('.mobile-menu-wrap');

  $('#openMenu').click(function (e) {
    e.preventDefault();
    menu.addClass("open-menu");
  });

  $(document).mouseup(function (e) {
    if (!menu.is(e.target) && menu.has(e.target).length === 0) {
      menu.removeClass("open-menu");
    }
  });

  $('.toggler').on('click', function(){
    var ul = $(this).next('ul');
    ul.slideToggle(250);
  });

  $('.lang').on('click', function(){
    $(this).toggleClass('active');
    $(this).next('ul').toggleClass('active');
  });

  var iMac = $('.imac'),
      iPhone = $('.iphone'),
      iPhoneLayer = $('.iphone-event-layer');

  var iMacAnimation = function(cover){

    var self = cover,
        firstClass = cover.attr('class'),
        timeout1, timeout2, timeout3,
        blocker = 0,
        videoCover = self.find('.video-wrapper'),
        video = videoCover.find('video');

    function reset(){
        self.attr('class', firstClass);
        $('.video-options').find('.option').removeClass('show active');
        iPhone.removeClass('hide');
        video[0].pause();
        video[0].currentTime = 0;
        setTimeout(function(){
          videoCover.show();
        }, 500);
    }

    self.on('mouseover', function(){

      blocker = 0;

      var firstClass = self.attr('class');
      
      iPhone.addClass('hide');
      self.addClass('ready expand active');

      if (blocker != 1) {
        var timeout1 = setTimeout(function(){
          if (blocker == 1) return;
          self.addClass('state-1');

          self.find('.percents').find('.percent').text('40%');
          self.find('.video-state').html('<div class="arrow"></div><div class="icon icon-stop"></div><div class="name">Video Paused</div>');
          self.find('.option').addClass('show active');

          if (blocker != 1) {
            var timeout2 = setTimeout(function(){
              if (blocker == 1) return;
              self.addClass('state-2');

              self.find('.percents').find('.percent').text('60%');
              self.find('.video-state').html('<div class="arrow"></div><div class="icon icon-play"></div><div class="name">Video Starts</div>');
              video[0].play();

              if (blocker != 1) {
                var timeout3 = setTimeout(function(){
                  if (blocker == 1) return;
                  self.addClass('state-3');

                  self.find('.video-state').html('<div class="arrow"></div><div class="icon icon-play"></div><div class="name">Video Plays</div>');
                  self.find('.percents').find('.percent').text('100%');

                  video.on('ended', function(){
                    self.find('.video-options').find('.option').removeClass('show active');
                    videoCover.slideUp(500, function(){
                      reset();
                    });
                  });

                }, 4000);
              }
            }, 3000);
          }
        }, 1000);
      }

    });
    self.on('mouseleave', function(){

        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
        blocker = 1;
        reset();        

      });
  }

  iMacAnimation(iMac);

  var iPhoneAnimation = function(cover){

    var self = cover,
        firstClass = cover.attr('class'),
        timeout1, timeout2, timeout3,
        blocker = 0,
        videoCover = self.find('.video-wrapper'),
        video = videoCover.find('video'),
        preventStarting = 0;

    function reset(){
        self.attr('class', firstClass);
        $('.video-options').find('.option').removeClass('show active');
        iPhone.removeClass('hide');
        video[0].pause();
        video[0].currentTime = 0;
        iPhoneLayer.removeClass('active');
        setTimeout(function(){
          videoCover.show();
        }, 500);

    }

    iPhoneLayer.on('click', function(){

      if (preventStarting == 1) return false;

      preventStarting = 1;

      blocker = 0;

      var options = ({
          'rate': 30,
          'controls': false,
          'autoplay': true,
          'backwards': false,
          'startFrame': 10,
          'width': '156px',
          'height': '89px'
      });
      var player = new FramePlayer('my-player', options);
      player.poster('assets/images/poster.jpg', 300, 170);

      var firstClass = self.attr('class');
      
      iPhone.removeClass('hide');
      self.addClass('active');
      $(this).addClass('active');

      if (blocker != 1) {
        var timeout1 = setTimeout(function(){
          if (blocker == 1) return;
          self.addClass('state-1');

          self.find('.percents').find('.percent').text('40%');
          self.find('.video-state').html('<div class="arrow"></div><div class="icon icon-stop"></div><div class="name">Video Paused</div>');
          self.find('.option').addClass('show active');

          if (blocker != 1) {
            var timeout2 = setTimeout(function(){
              if (blocker == 1) return;
              self.addClass('state-2');

              self.find('.percents').find('.percent').text('60%');
              self.find('.video-state').html('<div class="arrow"></div><div class="icon icon-play"></div><div class="name">Video Starts</div>');
              video[0].play();
              player.play();

              if (blocker != 1) {
                var timeout3 = setTimeout(function(){
                  if (blocker == 1) return;
                  self.addClass('state-3');

                  self.find('.video-state').html('<div class="arrow"></div><div class="icon icon-play"></div><div class="name">Video Plays</div>');
                  self.find('.percents').find('.percent').text('100%');

                  video.on('ended', function(){
                    self.find('.video-options').find('.option').removeClass('show active');
                    videoCover.slideUp(500, function(){
                      reset();
                    });
                  });
                  setTimeout(function(){
                    preventStarting = 0;
                  }, 10000);

                }, 4000);
              }
            }, 3000);
          }
        }, 1000);
      }

    });
    iPhoneLayer.on('mouseleave', function(){

        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
        blocker = 1;
        reset();        

        $('#my-player').find('canvas').remove();
        preventStarting = 0;

      });
  }

  iPhoneAnimation(iPhone);

});


































