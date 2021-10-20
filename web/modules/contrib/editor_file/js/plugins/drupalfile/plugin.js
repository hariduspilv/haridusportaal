/**
 * @file
 * Drupal File plugin.
 *
 * @ignore
 */

(function ($, Drupal, drupalSettings, CKEDITOR) {

  "use strict";

  function parseAttributes(element) {
    var parsedAttributes = {};

    var domElement = element.$;
    var attribute = null;
    var attributeName;
    for (var attrIndex = 0; attrIndex < domElement.attributes.length; attrIndex++) {
      attribute = domElement.attributes.item(attrIndex);
      attributeName = attribute.nodeName.toLowerCase();
      // Don't consider data-cke-saved- attributes; they're just there to work
      // around browser quirks.
      if (attributeName.substring(0, 15) === 'data-cke-saved-') {
        continue;
      }
      // Store the value for this attribute, unless there's a data-cke-saved-
      // alternative for it, which will contain the quirk-free, original value.
      parsedAttributes[attributeName] = element.data('cke-saved-' + attributeName) || attribute.nodeValue;
    }
    return parsedAttributes;
  }

  CKEDITOR.plugins.add('drupalfile', {
    init: function (editor) {
      // Add the commands for file and unfile.
      editor.addCommand('drupalfile', {
        allowedContent: {
          a: {
            attributes: {
              '!href': true,
              '!data-entity-type': true,
              '!data-entity-uuid': true
            },
            classes: {}
          }
        },
        requiredContent: new CKEDITOR.style({
          element: 'a',
          attributes: {
            'href': '',
            'data-entity-type': '',
            'data-entity-uuid': ''
          }
        }),
        modes: {wysiwyg: 1},
        canUndo: true,
        exec: function (editor) {
          var drupalImageUtils = CKEDITOR.plugins.drupalimage;
          var focusedImageWidget = drupalImageUtils && drupalImageUtils.getFocusedWidget(editor);
          var fileElement = getSelectedFile(editor);

          // Set existing values based on selected element.
          var existingValues = {};
          if (fileElement && fileElement.$) {
            existingValues = parseAttributes(fileElement);
          }
          // Or, if an image widget is focused, we're editing a link wrapping
          // an image widget.
          else if (focusedImageWidget && focusedImageWidget.data.link) {
            existingValues = CKEDITOR.tools.clone(focusedImageWidget.data.link);
          }

          // Prepare a save callback to be used upon saving the dialog.
          var saveCallback = function (returnValues) {
            // If an image widget is focused, we're not editing an independent
            // link, but we're wrapping an image widget in a link.
            if (focusedImageWidget) {
              focusedImageWidget.setData('link', CKEDITOR.tools.extend(returnValues.attributes, focusedImageWidget.data.link));
              editor.fire('saveSnapshot');
              return;
            }

            editor.fire('saveSnapshot');

            // Create a new file element if needed.
            if (!fileElement && returnValues.attributes.href) {
              var selection = editor.getSelection();
              var range = selection.getRanges(1)[0];

              // Use the link title or the file name as text with a collapsed
              // cursor.
              if (range.collapsed) {
                var text = returnValues.attributes.filename;
                text = new CKEDITOR.dom.text(text, editor.document);
                range.insertNode(text);
                range.selectNodeContents(text);
              }

              // Create the new file by applying a style to the new text.
              var style = new CKEDITOR.style({element: 'a', attributes: returnValues.attributes});
              style.type = CKEDITOR.STYLE_INLINE;
              style.applyToRange(range);
              range.select();

              // Set the file so individual properties may be set below.
              fileElement = getSelectedFile(editor);
            }
            // Update the file properties.
            else if (fileElement) {
              for (var attrName in returnValues.attributes) {
                if (returnValues.attributes.hasOwnProperty(attrName)) {
                  // Update the property if a value is specified.
                  if (returnValues.attributes[attrName].length > 0) {
                    var value = returnValues.attributes[attrName];
                    fileElement.data('cke-saved-' + attrName, value);
                    fileElement.setAttribute(attrName, value);
                  }
                  // Delete the property if set to an empty string.
                  else {
                    fileElement.removeAttribute(attrName);
                  }
                }
              }
            }

            // Save snapshot for undo support.
            editor.fire('saveSnapshot');
          };
          // Drupal.t() will not work inside CKEditor plugins because CKEditor
          // loads the JavaScript file instead of Drupal. Pull translated
          // strings from the plugin settings that are translated server-side.
          var dialogSettings = {
            title: fileElement ? editor.config.drupalFile_dialogTitleEdit : editor.config.drupalFile_dialogTitleAdd,
            dialogClass: 'editor-file-dialog'
          };

          // Open the dialog for the edit form.
          Drupal.ckeditor.openDialog(editor, Drupal.url('editor_file/dialog/file/' + editor.config.drupal.format), existingValues, saveCallback, dialogSettings);
        }
      });

      // Add buttons for file upload.
      if (editor.ui.addButton) {
        editor.ui.addButton('DrupalFile', {
          label: Drupal.t('File'),
          command: 'drupalfile',
          icon: this.path + '/file.png'
        });
      }

      editor.on('doubleclick', function (evt) {
        var element = getSelectedFile(editor) || evt.data.element;

        if (!element.isReadOnly()) {
          if (element.is('a') && element.getAttribute('data-entity-type') === 'file') {
            editor.getSelection().selectElement(element);
            editor.getCommand('drupalfile').exec();
          }
        }
      });

      // If the "menu" plugin is loaded, register the menu items.
      if (editor.addMenuItems) {
        editor.addMenuItems({
          file: {
            label: Drupal.t('Edit File'),
            command: 'drupalfile',
            group: 'link',
            order: 1
          }
        });
      }

      // If the "contextmenu" plugin is loaded, register the listeners.
      if (editor.contextMenu) {
        editor.contextMenu.addListener(function (element, selection) {
          if (!element || element.isReadOnly()) {
            return null;
          }
          var anchor = getSelectedFile(editor);
          if (!anchor) {
            return null;
          }

          var menu = {};
          if (anchor.getAttribute('href') && anchor.getChildCount()) {
            menu = {file: CKEDITOR.TRISTATE_OFF};
          }
          return menu;
        });
      }
    }
  });

  /**
   * Get the surrounding file element of current selection.
   *
   * The following selection will all return the file element.
   *
   * @example
   *  <a href="#">li^nk</a>
   *  <a href="#">[file]</a>
   *  text[<a href="#">file]</a>
   *  <a href="#">li[nk</a>]
   *  [<b><a href="#">li]nk</a></b>]
   *  [<a href="#"><b>li]nk</b></a>
   *
   * @param {CKEDITOR.editor} editor
   *   The CKEditor editor object
   *
   * @return {?HTMLElement}
   *   The selected file element, or null.
   */
  function getSelectedFile(editor) {
    var selection = editor.getSelection();
    var selectedElement = selection.getSelectedElement();
    if (selectedElement && selectedElement.is('a')) {
      return selectedElement;
    }

    var range = selection.getRanges(true)[0];

    if (range) {
      range.shrink(CKEDITOR.SHRINK_TEXT);
      return editor.elementPath(range.getCommonAncestor()).contains('a', 1);
    }
    return null;
  }

})(jQuery, Drupal, drupalSettings, CKEDITOR);
