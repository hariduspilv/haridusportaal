(function ($, Drupal) {

    var container = $('#jsoneditor');
    var options = {
        mode: 'code',
        ace: ace
    };
    var editor = new JSONEditor(container[0], options);

    Drupal.behaviors.JsonValidatorBehavior = {
        attach: function (context, settings) {
            editor.set(JSON.parse(settings.json_object));
        }
    };

    $('.form-submit').click(function(){
        //event.preventDefault();
        try {
            var json = editor.get();
            $('#edit-xjson-definition-0-value').val(JSON.stringify(json));
        }catch(err){
            event.preventDefault();
            alert(err.message);
        }
    });

})(jQuery, Drupal);