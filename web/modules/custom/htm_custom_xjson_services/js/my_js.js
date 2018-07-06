(function ($, Drupal) {

    var container = $('#jsoneditor');
    var options = {
        mode: 'code',
        ace: ace
    };
    var editor = new JSONEditor(container[0], options);

    Drupal.behaviors.JsonValidatorBehavior = {
        attach: function (context, settings) {
            //dump(settings.json_object);
            editor.set(JSON.parse(settings.json_object));
        }
    };

    $('#getJSON').click(function(){
        console.log('je');
        event.preventDefault();
        var response = '';
        try {
            alert('OK');
        }catch(err){
            alert(err.message);
        }
    });

})(jQuery, Drupal);