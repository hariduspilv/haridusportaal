<?php

namespace Drupal\htm_custom_subscriptions\Plugin\GraphQL\Mutations;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql_core\Plugin\GraphQL\Mutations\Entity\CreateEntityBase;
use Drupal\graphql_core\Plugin\GraphQL\Mutations\Entity\UpdateEntityBase;
use Drupal\graphql_core\GraphQL\EntityCrudOutputWrapper;
use GraphQL\Type\Definition\ResolveInfo;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\htm_custom_graphql_functions\Language\CustomGraphqlLanguageNegotiator;
use Drupal\Core\Language\LanguageManager;
/**
 * Simple mutation for creating a new article node.
 *
 * @GraphQLMutation(
 *   id = "create_tag_subscription",
 *   entity_type = "subscription_entity",
 *   secure = true,
 *   name = "createTagSubscription",
 *   type = "EntityCrudOutput!",
 *   arguments = {
 *     "input" = "SubscriptionInput",
 * 		 "language" = "LanguageId!"
 *   }
 * )
 */
class CreateTagSubscription extends CreateEntityBase{
    /**
     * The entity type manager.
     *
     * @var \Drupal\Core\Entity\EntityTypeManagerInterface
     */
    protected $entityTypeManager;
    /**
     * The Custom Language Negotiator.
     *
     * @var \Drupal\htm_custom_graphql_functions\Language\CustomGraphqlLanguageNegotiator
     */
    protected $CustomGraphqlLanguageNegotiator;
    /**
     * @inheritDoc
     */
    public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition)
    {
        return new static(
            $configuration,
            $pluginId,
            $pluginDefinition,
            $container->get('entity_type.manager'),
            $container->get('htm_custom_graphql_functions.language_negotiator'),
            $container->get('language_manager'));
    }

    /**
     * @inheritDoc
     */
    public function __construct(
        array $configuration,
        $pluginId,
        $pluginDefinition,
        EntityTypeManagerInterface $entityTypeManager,
        CustomGraphqlLanguageNegotiator $CustomGraphqlLanguageNegotiator,
        LanguageManager $languageManager)
    {
        parent::__construct($configuration, $pluginId, $pluginDefinition, $entityTypeManager);
        $this->CustomGraphqlLanguageNegotiator = $CustomGraphqlLanguageNegotiator;
        $this->languageManager = $languageManager;
    }
    /**
     * @param $value
     * @param array $args
     * @param ResolveContext $context
     * @param ResolveInfo $info
     * @return array
     */
    protected function extractEntityInput($value, array $args, ResolveContext $context, ResolveInfo $info){
        return [
            'language' => $context->getContext('language', $info),
            'langcode' => $context->getContext('language', $info),
            'subscriber_email' => $args['input']['email'],
            'newtags' => $args['input']['newtags'],
        ];
    }
    /**
     * @inheritDoc
     */
    public function resolve($value, array $args, ResolveContext $context, ResolveInfo $info)
    {
        $this->languageManager->setNegotiator($this->CustomGraphqlLanguageNegotiator);

        // Set new language by its langcode.
        // Needed to re-run language negotiation.
        $this->languageManager->reset();
        $this->languageManager->getNegotiator()->setLanguageCode($args['language']);
        $context->setContext('language', $args['language'], $info);

        $entityTypeId = $this->pluginDefinition['entity_type'];
        $storage = $this->entityTypeManager->getStorage($entityTypeId);
        $entity = $storage->loadByProperties(['subscriber_email' => $args['input']['email']]);

        if(count($entity) > 0){
            $args['id'] = reset($entity)->id();
        }

        if(isset($args['id'])){

            // The raw input needs to be converted to use the proper field and property
            // keys because we usually convert them to camel case when adding them to
            // the schema. Allow the other implementations to control this easily.
            $input = $this->extractEntityInput($value, $args, $context, $info);
            try {
                foreach ($input as $key => $value) {
                    $entity->get($key)->setValue($value);
                }
            }
            catch (\InvalidArgumentException $exception) {
                return new EntityCrudOutputWrapper(NULL, NULL, [
                    $this->t('The entity update failed with exception: @exception.', ['@exception' => $exception->getMessage()]),
                ]);
            }
            if (($violations = $entity->validate()) && $violations->count()) {
                return new EntityCrudOutputWrapper(NULL, $violations);
            }
            if (($status = $entity->save()) && $status === SAVED_UPDATED) {
                return new EntityCrudOutputWrapper($entity);
            }
            return NULL;

        }else{
            return CreateEntityBase::resolve($value, $args, $context, $info);  // TODO: Change the autogenerated stub
        }
    }
}
