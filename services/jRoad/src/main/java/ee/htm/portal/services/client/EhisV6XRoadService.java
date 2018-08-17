package ee.htm.portal.services.client;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.EeIsikukaartResponseDocument.EeIsikukaartResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusDokumentDocument.VpTaotlusDokument;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusDokumentResponseDocument.VpTaotlusDokumentResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusEsitamineDocument.VpTaotlusEsitamine;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusEsitamineResponseDocument.VpTaotlusEsitamineResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusIsikudDocument.VpTaotlusIsikud;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusIsikudResponseDocument.VpTaotlusIsikudResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusKontaktDocument.VpTaotlusKontakt;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusKontaktResponseDocument.VpTaotlusKontaktResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusOpingudResponseDocument.VpTaotlusOpingudResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusSissetulekudDocument.VpTaotlusSissetulekud;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusSissetulekudResponseDocument.VpTaotlusSissetulekudResponse;

/**
 * <code>ehisv6</code> EHIS (Eesti Hariduse Infosüsteem -- Haridus- ja Teadusministeerium) database
 * X-tee v6 service.
 *
 * parameter userId - if null gets its value from xroad.properties id-code
 */
public interface EhisV6XRoadService {

  EeIsikukaartResponse eeIsikukaart(String personalCode, String format, String userId)
      throws XRoadServiceConsumptionException;

  VpTaotlusOpingudResponse vptOpingud(String personalCode, Object applicationId, String userId)
      throws XRoadServiceConsumptionException;

  VpTaotlusIsikudResponse vpTaotlusIsikud(VpTaotlusIsikud request, String userId)
      throws XRoadServiceConsumptionException;

  VpTaotlusSissetulekudResponse vpTaotlusSissetulekud(VpTaotlusSissetulekud request,
      String userId) throws XRoadServiceConsumptionException;

  VpTaotlusKontaktResponse vpTaotlusKontakt(VpTaotlusKontakt request, String userId)
      throws XRoadServiceConsumptionException;

  VpTaotlusEsitamineResponse vpTaotlusEsitamine(VpTaotlusEsitamine request, String userId)
      throws XRoadServiceConsumptionException;

  VpTaotlusDokumentResponse vpTaotlusDokument(VpTaotlusDokument request, String userId)
      throws XRoadServiceConsumptionException;
}
