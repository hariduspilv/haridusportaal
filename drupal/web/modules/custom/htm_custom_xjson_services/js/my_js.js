(function ($, Drupal, drupalSettings) {
    //console.log(drupalSettings);
    var containers = $('[id^=xjson_definition]');
    var options = {
        mode: 'code',
        ace: ace
    };

    var $object = {};

    $.each(containers, function(index, value){

        var elementId = containers[index].id;
        var variable_name = elementId;
        $object[variable_name] = new JSONEditor(value, options);
        $object[variable_name].set(JSON.parse(drupalSettings[elementId]));

    });
    //console.log($object);
    $('.form-submit').click(function(e){
        //e.preventDefault();
        try {
            $.each($object, function(index, value){
                var json = $object[index].get();
                var selector = index + '[0][value]';
                $('[name="'+selector+'"]').val(JSON.stringify(json));
                //console.log(json);
            });


            //$('#edit-xjson-definition-0-value').val(JSON.stringify(json));
        }catch(err){
            event.preventDefault();
            alert(err.message);
        }
    });
    /*var container = $('#jsoneditor');
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

    */

})(jQuery, Drupal, drupalSettings);