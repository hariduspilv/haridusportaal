(function ($, Drupal, drupalSettings) {
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

    $('.form-submit').click(function(){
        try {
            $.each($object, function(index, value){
                var json = $object[index].get();
                var selector = index + '[0][value]';
                $('[name="'+selector+'"]').val(JSON.stringify(json));
            });
        }catch(err){
            event.preventDefault();
            alert(err.message);
        }
    });

})(jQuery, Drupal, drupalSettings);