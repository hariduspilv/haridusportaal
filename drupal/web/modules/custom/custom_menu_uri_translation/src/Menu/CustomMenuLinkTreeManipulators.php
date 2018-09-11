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

	/**
	 * Performs access checks of a menu tree.
	 *
	 * Sets the 'access' property to AccessResultInterface objects on menu link
	 * tree elements. Descends into subtrees if the root of the subtree is
	 * accessible. Inaccessible subtrees are deleted, except the top-level
	 * inaccessible link, to be compatible with render caching.
	 *
	 * (This means that top-level inaccessible links are *not* removed; it is up
	 * to the code doing something with the tree to exclude inaccessible links,
	 * just like MenuLinkTree::build() does. This allows those things to specify
	 * the necessary cacheability metadata.)
	 *
	 * This is compatible with render caching, because of cache context bubbling:
	 * conditionally defined cache contexts (i.e. subtrees that are only
	 * accessible to some users) will bubble just like they do for render arrays.
	 * This is why inaccessible subtrees are deleted, except at the top-level
	 * inaccessible link: if we didn't keep the first (depth-wise) inaccessible
	 * link, we wouldn't be able to know which cache contexts would cause those
	 * subtrees to become accessible again, thus forcing us to conclude that that
	 * subtree is unconditionally inaccessible.
	 *
	 * @param \Drupal\Core\Menu\MenuLinkTreeElement[] $tree
	 *   The menu link tree to manipulate.
	 *
	 * @return \Drupal\Core\Menu\MenuLinkTreeElement[]
	 *   The manipulated menu link tree.
	 */
	public function checkAccess(array $tree) {
		foreach ($tree as $key => $element) {
			// Other menu tree manipulators may already have calculated access, do not
			// overwrite the existing value in that case.
			if (!isset($element->access)) {
				$tree[$key]->access = $this->menuLinkCheckAccess($element->link);
			}
			if ($tree[$key]->access->isAllowed()) {
				if ($tree[$key]->subtree) {
					$tree[$key]->subtree = $this->checkAccess($tree[$key]->subtree);
				}
			}else {
				unset($tree[$key]);
			}
		}
		return $tree;
	}
}