package ee.htm.portal.services.client;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import ee.htm.portal.services.types.ee.riik.xtee.kutseregister.producers.producer.kutseregister.KodanikKutsetunnistusVastusDocument.KodanikKutsetunnistusVastus;

/**
 * <code>kutseregister</code> Kutseregister database X-tee v6 service.
 *
 * parameter userId - if null gets its value from xroad.properties id-code
 */
public interface KutseregisterXRoadService {

  KodanikKutsetunnistusVastus kodanikKutsetunnistus(boolean invalidBoolean, String userId)
      throws XRoadServiceConsumptionException;
}
