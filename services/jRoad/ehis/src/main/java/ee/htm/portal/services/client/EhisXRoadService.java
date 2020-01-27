package ee.htm.portal.services.client;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import com.nortal.jroad.model.XRoadMessage;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.EeIsikukaartResponseDocument.EeIsikukaartResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysDokumentResponseDocument.MtsysDokumentResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysEsitaTegevuslubaDocument.MtsysEsitaTegevusluba;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysEsitaTegevuslubaResponseDocument.MtsysEsitaTegevuslubaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysEsitaTegevusnaitajadDocument.MtsysEsitaTegevusnaitajad;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysEsitaTegevusnaitajadResponseDocument.MtsysEsitaTegevusnaitajadResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysKlfTeenusResponseDocument.MtsysKlfTeenusResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeOppeasutusDocument.MtsysLaeOppeasutus;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeOppeasutusResponseDocument.MtsysLaeOppeasutusResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeTegevuslubaDocument.MtsysLaeTegevusluba;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeTegevuslubaResponseDocument.MtsysLaeTegevuslubaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeTegevusnaitajadDocument.MtsysLaeTegevusnaitajad;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeTegevusnaitajadResponseDocument.MtsysLaeTegevusnaitajadResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysOppeasutusResponseDocument.MtsysOppeasutusResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevusloadResponseDocument.MtsysTegevusloadResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevuslubaResponseDocument.MtsysTegevuslubaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevusnaitajaDocument.MtsysTegevusnaitaja;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevusnaitajaResponseDocument.MtsysTegevusnaitajaResponse;
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
import java.math.BigInteger;

/**
 * <code>ehis</code> EHIS (Eesti Hariduse Infosüsteem -- Haridus- ja Teadusministeerium) database
 * X-tee v6 service.
 * <p>
 * parameter userId - if null gets its value from xroad.properties id-code
 */
public interface EhisXRoadService {

  XRoadMessage<EeIsikukaartResponse> eeIsikukaart(String personalCode, String format, String userId,
      String[] andmeplokk, String[] andmekirje, String[] valjundiTyyp)
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

  MtsysKlfTeenusResponse mtsysKlfTeenus(String userId) throws XRoadServiceConsumptionException;

  MtsysTegevusloadResponse mtsysTegevusload(String identifier, String userId)
      throws XRoadServiceConsumptionException;

  MtsysTegevuslubaResponse mtsysTegevusluba(BigInteger identifier, String userId)
      throws XRoadServiceConsumptionException;

  MtsysLaeTegevuslubaResponse mtsysLaeTegevusluba(MtsysLaeTegevusluba request, String userId)
      throws XRoadServiceConsumptionException;

  MtsysEsitaTegevuslubaResponse mtsysEsitaTegevusluba(MtsysEsitaTegevusluba request, String userId)
      throws XRoadServiceConsumptionException;

  MtsysOppeasutusResponse mtsysOppeasutus(BigInteger identifier, String userId)
      throws XRoadServiceConsumptionException;

  MtsysLaeOppeasutusResponse mtsysLaeOppeasutus(MtsysLaeOppeasutus request, String userId)
      throws XRoadServiceConsumptionException;

  MtsysTegevusnaitajaResponse mtsysTegevusnaitaja(MtsysTegevusnaitaja request, String userId)
      throws XRoadServiceConsumptionException;

  MtsysLaeTegevusnaitajadResponse mtsysLaeTegevusnaitajad(MtsysLaeTegevusnaitajad request,
      String userId) throws XRoadServiceConsumptionException;

  MtsysEsitaTegevusnaitajadResponse mtsysEsitaTegevusnaitajad(MtsysEsitaTegevusnaitajad request,
      String userId) throws XRoadServiceConsumptionException;

  MtsysDokumentResponse mtsysDokument(Integer identifier, Integer documentId, String userId)
      throws XRoadServiceConsumptionException;
}
