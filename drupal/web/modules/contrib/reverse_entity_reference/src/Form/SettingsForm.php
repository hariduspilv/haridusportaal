<?php

namespace Drupal\reverse_entity_reference\Form;

use Drupal\Core\Form\ConfigFormBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Field\FieldTypePluginManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Field\Plugin\Field\FieldType\EntityReferenceItem;


class SettingsForm extends ConfigFormBase {

    /**
     * @var FieldTypePluginManagerInterface $fieldTypeManager
     */
    protected $fieldTypeManager;
    
    /**
     * @var EntityTypeManagerInterface $entityTypeManager
     */
    protected $entityTypeManager;

    /**
     * {@inheritdoc}
     */
    public function __construct(ConfigFactoryInterface $config_factory, FieldTypePluginManagerInterface $fieldTypeManager, EntityTypeManagerInterface $entityTypeManager) {
        parent::__construct($config_factory);
        $this->fieldTypeManager = $fieldTypeManager;
        $this->entityTypeManager = $entityTypeManager;
    }

    /**
    * {@inheritdoc}
    */
    public static function create(ContainerInterface $container) {
        return new static(
            $container->get('config.factory'),
            $container->get('plugin.manager.field.field_type'),
            $container->get('entity_type.manager')
        );
    }

    /**
     * {@inheritdoc}.
     */
    public function getFormId(){
        return 'reverse_entity_reference_settings_form';
    }
    /**
     * {@inheritdoc}.  
     */
    public function buildForm(array $form, FormStateInterface $form_state){
        // Form constructor
        $form = parent::buildForm($form, $form_state);
        // Default / Previous settings
        //@TODO: hide api key / client id values ... should be password field
        $config = $this->config('reverse_entity_reference.settings');
        $field_types = $this->getReferenceFieldTypes();
        $entity_types = $this->getEntityTypes();

        $form['allowed_field_types'] = array(
            '#type' => 'select',
            '#title' => t('Allowed Field Types'),
            '#default_value' => $config->get('allowed_field_types'),
            '#options' => $field_types,
            '#multiple' => TRUE,
        );

        $form['disallowed_entity_types'] = array(
            '#type' => 'select',
            '#title' => t('Disallowed Entity Types'),
            '#description' => t('A list of entity types that you do not want to be reverse referenced.'),
            '#default_value' => $config->get('disallowed_entity_types'),
            '#options' => $entity_types,
            '#multiple' => TRUE,
        );

        $form['allow_custom_storage'] = array(
            '#type' => 'checkbox',
            '#title' => t('Allow Custom Storage'),
            '#description' => t("Use with caution with disallowed entity types. Often times, ".
                                "an entity that has custom storage shouldn't be reverse referenced ".
                                "because they can't be queried from the database."),
            '#default_value' => $config->get('allow_custom_storage'),
        );
        return $form;
    }
    
    /**
     * Gets any field types that extend from the entity_reference field.
     * i.e. entity_reference_revisions, file, image etc.
     *
     * @return string[]
     *  an array of field names field by field type id.
     */
    protected function getReferenceFieldTypes(){
        $field_definitions = $this->fieldTypeManager->getDefinitions();
        $field_definitions = array_filter( $field_definitions, function($definition) use ($field_definitions){
            $er_extension = is_subclass_of($definition['class'], $field_definitions['entity_reference']['class']);
            $is_er = $definition['class'] === $field_definitions['entity_reference']['class'];
            return( $er_extension || $is_er );
        });
        return array_combine(array_keys($field_definitions), array_map(function($definition){
            return $definition['label'];
        },$field_definitions));
    }

    /**
     * Gets the entity type list suitable for a select list
     *
     * @return string[]
     *  an array of entity type names by entity type id.
     */
    protected function getEntityTypes(){
        $entity_types = $this->entityTypeManager->getDefinitions();
        
        return array_combine(array_keys($entity_types), array_map(function($definition){
            return $definition->getLabel();
        },$entity_types));
    }

    /**
     * {@inheritdoc};
     */
    public function submitForm(array &$form, FormStateInterface $form_state) {
        $this->config('reverse_entity_reference.settings')
            ->set('allowed_field_types', $form_state->getValue('allowed_field_types'))
            ->set('disallowed_entity_types', $form_state->getValue('disallowed_entity_types'))
            ->set('allow_custom_storage', $form_state->getValue('allow_custom_storage'))
            ->save();
        return parent::submitForm($form, $form_state);
    }
    /**
     * {@inheritdoc};
     */
    public function getEditableConfigNames() {
        return array(
            'reverse_entity_reference.settings'
        );
    }

}
