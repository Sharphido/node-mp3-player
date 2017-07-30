
    window.onload = () => {
      let obj = {};
      $.ajax({
        url: 'http://localhost:3000',
        data: {},
        type: 'POST',
        success: (data) => {
          obj = JSON.parse(data);
          for (let i = 0; i < obj.dirs.length; i++) {
            $('#navigation').append('<div class="nav_elt album">' + obj.dirs[i] + '</div>');
          }
          for (let i = 0; i < obj.files.length; i++) {
            $('#content').append('<div id="song' + i + '" class="song" title="' + 'mp3/' + obj.dirs[0] + '/' + obj.files[i].file + '">' + obj.files[i].file.split('.')[0] + '</div>');
          }

          $('.song').click(() => {
            $('#audio').prop('currentTime', 0);
            $('#audio_src').attr('src', $(this).attr('title'));
            $('#audio_src').prop('src', $(this).attr('title'));
            $('#audio').trigger('load');
            $('#audio').bind('loadeddata', () => {
              console.log('mp3 loaded');
            });

            $('#audio').trigger('play');
            $('#a_play').addClass('none');
            $('#a_pause').removeClass('none');
            $('#audio_src').attr('title', $(this).attr('id'));
          });

          $('.album').click(() => {
            let albumName = $(this).html();
            $.ajax({
              url: 'http://localhost:3000',
              data: {
                'album': albumName
              },
              type: 'POST',
              success: (data) => {
                obj = JSON.parse(data);
                console.log(obj);
                $('#content').empty();
                for (let i = 0; i < obj.files.length; i++) {
                  $('#content').append('<div id="song' + i + '" class="song" title="' + 'mp3/' + albumName + '/' + obj.files[i].file + '">' + obj.files[i].file.split('.')[0] + '</div>');
                }
                $('.song').click(() => {
                  $('#audio').prop('currentTime', 0);
                  $('#audio_src').attr('src', $(this).attr('title'));
                  $('#audio_src').prop('src', $(this).attr('title'));
                  $('#audio').trigger('load');
                  $('#audio').bind('loadeddata', () => {
                    console.log('mp3 jest załadowane');
                  });

                  $('#audio').trigger('play');
                  $('#a_play').addClass('none');
                  $('#a_pause').removeClass('none');
                  $('#audio_src').attr('title', $(this).attr('id'));

                });
              },
              error: (xhr, status, error) => {
                console.log('Error: ' + error.message);
              },
            });
          });
        },
        error: (xhr, status, error) => {
          console.log('Error: ' + error.message);
        },
      });
      $('#a_play').click(() => {
        if (!$('#audio_src').attr('src'))
          return;
        $('#audio').trigger('play');
        $('#a_play').addClass('none');
        $('#a_pause').removeClass('none');
      });
      $('#a_pause').click(() => {
        $('#audio').trigger('pause');
        $('#a_play').removeClass('none');
        $('#a_pause').addClass('none');
      });

      $('#audio').bind('timeupdate', () => {
        console.log('mp3 jest odgrywane')
        $('#playtime').css('width',
          (Number($('#audio').prop('currentTime')) / Number($('#audio').prop('duration')) * 100) + '%');
      });
      $('#playtime_bg').mousedown((event) => {
        let percent = event.clientX - 192;
        percent /= parseInt($('#footer').css('width'));
        console.log(percent * 100);
        console.log(parseInt($('#audio').prop('duration') * percent));
        $('#audio').prop('currentTime', parseInt($('#audio').prop('duration') * percent));
      });

      $('#a_prev').click(() => {
        if ($('#audio_src').attr('title') === 'song0' || !$('#audio_src').attr('src')) {
          return;
        }
        let prev = Number($('#audio_src').attr('title').replace('song', '')) - 1;
        prev = '#song' + prev;
        console.log(prev);
        $('#audio').prop('currentTime', 0);
        $('#audio_src').attr('src', $(prev).attr('title'));
        $('#audio_src').prop('src', $(prev).attr('title'));
        $('#audio').trigger('load');
        $('#audio').bind('loadeddata', () => {
          console.log('mp3 jest załadowane');
        });

        $('#audio').trigger('play');
        $('#a_play').addClass('none');
        $('#a_pause').removeClass('none');
        $('#audio_src').attr('title', $(prev).attr('id'));

      });
      $('#a_next').click(() => {
        if (Number($('#audio_src').attr('title').replace('song', '')) == obj.files.length - 1 || !$('#audio_src').attr('src')) {
          return;
        }
        let next = Number($('#audio_src').attr('title').replace('song', '')) + 1;
        next = '#song' + next;
        console.log(next);
        $('#audio').prop('currentTime', 0);
        $('#audio_src').attr('src', $(next).attr('title'));
        $('#audio_src').prop('src', $(next).attr('title'));
        $('#audio').trigger('load');
        $('#audio').bind('loadeddata', () => {
          console.log('mp3 jest załadowane');
        });

        $('#audio').trigger('play');
        $('#a_play').addClass('none');
        $('#a_pause').removeClass('none');
        $('#audio_src').attr('title', $(next).attr('id'));

      });
    };
  