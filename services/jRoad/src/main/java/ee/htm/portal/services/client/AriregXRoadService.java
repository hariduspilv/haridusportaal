package ee.htm.portal.services.client;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import ee.htm.portal.services.types.eu.x_road.arireg.producer.EsindusV1Response;

/**
 * <code>arireg</code> Äriregister database X-tee v6 service.
 *
 * parameter userId - if null gets its value from xroad.properties id-code
 */
public interface AriregXRoadService {

  EsindusV1Response getEsindusV1(String personalCode, String countryCode, String userId)
      throws XRoadServiceConsumptionException;
}
