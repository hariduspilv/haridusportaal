(function ($, Drupal) {
    var container = $('#jsoneditor');
    console.log(container);
    var options = {
        mode: 'code',
        ace: ace
    };
    var editor = new JSONEditor(container[0], options);

    var json = {
        _id: 123456,
        name: 'Johnnn',
        age: 32
    };

    //var editor = new JSONEditor(container, options, json);
    Drupal.behaviors.JsonValidatorBehavior = {
        attach: function (context, settings) {
            console.log(context);
            console.log(settings.lotus_height);
            // can access setting from 'drupalSettings';
            editor.set(json);

        }
    };

    $('#getJSON').click(function(){
        console.log('je');
        event.preventDefault();
        var response = '';
        try {
            console.log(editor.get());
        }catch(err){
            alert(err.message);
        }

    });
})(jQuery, Drupal);