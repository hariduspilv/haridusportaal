package ee.htm.portal.services.client;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.EeIsikukaartResponseDocument.EeIsikukaartResponse;

/**
 * <code>ehisv6</code> EHIS (Eesti Hariduse Infosüsteem -- Haridus- ja Teadusministeerium) database
 * X-tee v6 service.
 */
public interface EhisV6XRoadService {

  /**
   * @param userId - if null gets its value from xroad.properties id-code
   */
  EeIsikukaartResponse eeIsikukaart(String isikukood, String format, String userId)
      throws XRoadServiceConsumptionException;

}
