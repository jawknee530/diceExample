$(function (){

  $('#roll').on('keyup', function(ev){
    if(ev.keyCode === 13) {
      var params = {
        roll: $(this).val()
      };

      //$('#results').hide();

      $.get('/roll', params, function(data) {
        console.log(data)
        $('#results').text(data);//.fadeIn(800);
      });
    };
  });
});
