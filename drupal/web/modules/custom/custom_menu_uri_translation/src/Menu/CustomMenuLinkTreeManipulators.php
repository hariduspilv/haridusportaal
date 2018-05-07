<?php

namespace Drupal\custom_menu_uri_translation\Menu;

use Drupal\Core\Menu\DefaultMenuLinkTreeManipulators;


class CustomMenuLinkTreeManipulators extends DefaultMenuLinkTreeManipulators {
	/**
	 * Overrides default menu link for Angular links (internal but not routed)
	 * and return only if menu link has the same language
	 *
	 * @param \Drupal\Core\Menu\MenuLinkTreeElement[] $tree
	 *   The menu link tree to manipulate.
	 *
	 * @return \Drupal\Core\Menu\MenuLinkTreeElement[]
	 *   The manipulated menu link tree.
	 */
	public function OverrideLinks(array $tree) {
		$new_tree = [];
		foreach ($tree as $key => $v) {
			$instance = $tree[$key]->link;
			$plugin_id = $instance->getPluginId();
			$language = \Drupal::languageManager()->getCurrentLanguage()->getId();

			$translated = TRUE;

			if(strpos($plugin_id, 'menu_link_content') !== FALSE){
				$link_entity = \Drupal::service('entity.repository')
						->loadEntityByUuid('menu_link_content', $instance->getDerivativeId());

				// We have entity, now, let's translate it.
				$translated_entity = \Drupal::service('entity.repository')->getTranslationFromContext($link_entity);

				$url = $translated_entity->link_override->first();
				if(!$url->isEmpty()){
					$instance->updateLink(['url' => $url->get('uri')->getValue()], FALSE);
				}
				if($link_entity->hasTranslation($language) === FALSE) $translated = FALSE;
			}

			if ($tree[$key]->subtree) {
				$tree[$key]->subtree = $this->OverrideLinks($tree[$key]->subtree);
			}

			if($translated) $new_tree[$key] = $tree[$key];
		}

		return $new_tree;
	}
}