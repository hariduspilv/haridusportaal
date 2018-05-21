<?php

namespace Drupal\jsonapi\EventSubscriber;

use Drupal\Core\Cache\CacheableResponse;
use Drupal\Core\Cache\CacheableResponseInterface;
use Drupal\Core\Render\RenderContext;
use Drupal\Core\Render\RendererInterface;
use Drupal\jsonapi\ResourceResponse;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * Response subscriber that serializes and removes ResourceResponses' data.
 *
 * @see \Drupal\rest\EventSubscriber\ResourceResponseSubscriber
 * @internal
 *
 * This is 99% identical to:
 *
 * \Drupal\rest\EventSubscriber\ResourceResponseSubscriber
 *
 * but with a few differences:
 * 1. It has the @jsonapi.serializer_do_not_use_removal_imminent service
 *    injected instead of @serializer
 * 2. It has the @current_route_match service no longer injected
 * 3. It hardcodes the format to 'api_json'
 * 4. In the call to the serializer, it passes in the request and cacheable
 *    metadata as serialization context.
 *    https://www.drupal.org/project/jsonapi/issues/2948666 will change this.
 * 5. It flattens only to a cacheable response if the HTTP method is cacheable.
 */
class ResourceResponseSubscriber implements EventSubscriberInterface {

  /**
   * The serializer.
   *
   * @var \Symfony\Component\Serializer\SerializerInterface
   */
  protected $serializer;

  /**
   * The renderer.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * Constructs a ResourceResponseSubscriber object.
   *
   * @param \Symfony\Component\Serializer\SerializerInterface $serializer
   *   The serializer.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer.
   */
  public function __construct(SerializerInterface $serializer, RendererInterface $renderer) {
    $this->serializer = $serializer;
    $this->renderer = $renderer;
  }

  /**
   * {@inheritdoc}
   *
   * @see \Drupal\rest\EventSubscriber\ResourceResponseSubscriber::getSubscribedEvents()
   * @see \Drupal\dynamic_page_cache\EventSubscriber\DynamicPageCacheSubscriber
   */
  public static function getSubscribedEvents() {
    // Run before the dynamic page cache subscriber (priority 100), so that
    // Dynamic Page Cache can cache flattened responses.
    $events[KernelEvents::RESPONSE][] = ['onResponse', 128];
    return $events;
  }

  /**
   * Serializes ResourceResponse responses' data, and removes that data.
   *
   * @param \Symfony\Component\HttpKernel\Event\FilterResponseEvent $event
   *   The event to process.
   */
  public function onResponse(FilterResponseEvent $event) {
    $response = $event->getResponse();
    if (!$response instanceof ResourceResponse) {
      return;
    }

    $request = $event->getRequest();
    $format = 'api_json';
    $this->renderResponseBody($request, $response, $this->serializer, $format);
    $event->setResponse($this->flattenResponse($response, $request));
  }

  /**
   * Renders a resource response body.
   *
   * Serialization can invoke rendering (e.g., generating URLs), but the
   * serialization API does not provide a mechanism to collect the
   * bubbleable metadata associated with that (e.g., language and other
   * contexts), so instead, allow those to "leak" and collect them here in
   * a render context.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   * @param \Drupal\jsonapi\ResourceResponse $response
   *   The response from the JSON API resource.
   * @param \Symfony\Component\Serializer\SerializerInterface $serializer
   *   The serializer to use.
   * @param string|null $format
   *   The response format, or NULL in case the response does not need a format,
   *   for example for the response to a DELETE request.
   *
   * @todo Add test coverage for language negotiation contexts in
   *   https://www.drupal.org/node/2135829.
   */
  protected function renderResponseBody(Request $request, ResourceResponse $response, SerializerInterface $serializer, $format) {
    $data = $response->getResponseData();

    // If there is data to send, serialize and set it as the response body.
    if ($data !== NULL) {
      $context = new RenderContext();
      $render_function = function () use ($serializer, $data, $format, $request, $response) {
        // The serializer receives the response's cacheability metadata object
        // as serialization context. Normalizers called by the serializer then
        // refine this cacheability metadata, and thus they are effectively
        // updating the response object's cacheability.
        // @todo In principle JSON API uses normalizer value objects to achieve
        // this, and hence normalizers should not rely on this global context.
        // https://www.drupal.org/project/jsonapi/issues/2940342 brought us a
        // long way, but not yet 100%. We will go all the way in
        // https://www.drupal.org/project/jsonapi/issues/2948666.
        // Note that \Drupal\jsonapi\Controller\RequestHandler::handle() calls
        // a method on EntityResource in a render context.
        return $serializer->serialize($data, $format, [
          'request' => $request,
          'cacheable_metadata' => $response->getCacheableMetadata(),
          'resource_type' => $request->get('resource_type'),
        ]);
      };
      $output = $this->renderer->executeInRenderContext($context, $render_function);

      if ($response instanceof CacheableResponseInterface && !$context->isEmpty()) {
        $response->addCacheableDependency($context->pop());
      }

      $response->setContent($output);
      $response->headers->set('Content-Type', $request->getMimeType($format));
    }
  }

  /**
   * Flattens a fully rendered resource response.
   *
   * Ensures that complex data structures in ResourceResponse::getResponseData()
   * are not serialized. Not doing this means that caching this response object
   * requires deserializing the PHP data when reading this response object from
   * cache, which can be very costly, and is unnecessary.
   *
   * @param \Drupal\jsonapi\ResourceResponse $response
   *   A fully rendered resource response.
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request for which this response is generated.
   *
   * @return \Drupal\Core\Cache\CacheableResponse|\Symfony\Component\HttpFoundation\Response
   *   The flattened response.
   */
  protected static function flattenResponse(ResourceResponse $response, Request $request) {
    $final_response = ($response instanceof CacheableResponseInterface && $request->isMethodCacheable()) ? new CacheableResponse() : new Response();
    $final_response->setContent($response->getContent());
    $final_response->setStatusCode($response->getStatusCode());
    $final_response->setProtocolVersion($response->getProtocolVersion());
    $final_response->setCharset($response->getCharset());
    $final_response->headers = clone $response->headers;
    if ($final_response instanceof CacheableResponseInterface) {
      $final_response->addCacheableDependency($response->getCacheableMetadata());
    }
    return $final_response;
  }

}
