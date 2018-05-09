package ee.htm.portal.services.client;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.EeIsikukaartResponseDocument.EeIsikukaartResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusOpingudResponseDocument.VpTaotlusOpingudResponse;

/**
 * <code>ehisv6</code> EHIS (Eesti Hariduse Infosüsteem -- Haridus- ja Teadusministeerium) database
 * X-tee v6 service.
 *
 * @param userId - if null gets its value from xroad.properties id-code
 */
public interface EhisV6XRoadService {

  EeIsikukaartResponse eeIsikukaart(String isikukood, String format, String userId)
      throws XRoadServiceConsumptionException;

  VpTaotlusOpingudResponse vptOpingud(String isikukood, Object taotlusId, String userId)
      throws XRoadServiceConsumptionException;

}
