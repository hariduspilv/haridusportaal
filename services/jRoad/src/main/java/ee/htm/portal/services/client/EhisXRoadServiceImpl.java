package ee.htm.portal.services.client;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import ee.htm.portal.services.database.EhisXRoadDatabaseImpl;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.EeIsikukaartDocument.EeIsikukaart;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.EeIsikukaartResponseDocument.EeIsikukaartResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysEsitaTegevuslubaDocument.MtsysEsitaTegevusluba;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysEsitaTegevuslubaResponseDocument.MtsysEsitaTegevuslubaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysKlfTeenusResponseDocument.MtsysKlfTeenusResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeOppeasutusDocument.MtsysLaeOppeasutus;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeOppeasutusResponseDocument.MtsysLaeOppeasutusResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeTegevuslubaDocument.MtsysLaeTegevusluba;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeTegevuslubaResponseDocument.MtsysLaeTegevuslubaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysOppeasutusDocument.MtsysOppeasutus;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysOppeasutusResponseDocument.MtsysOppeasutusResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevusloadDocument.MtsysTegevusload;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevusloadResponseDocument.MtsysTegevusloadResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevuslubaDocument.MtsysTegevusluba;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevuslubaResponseDocument.MtsysTegevuslubaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusDokumentDocument.VpTaotlusDokument;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusDokumentResponseDocument.VpTaotlusDokumentResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusEsitamineDocument.VpTaotlusEsitamine;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusEsitamineResponseDocument.VpTaotlusEsitamineResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusIsikudDocument.VpTaotlusIsikud;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusIsikudResponseDocument.VpTaotlusIsikudResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusKontaktDocument.VpTaotlusKontakt;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusKontaktResponseDocument.VpTaotlusKontaktResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusOpingudDocument.VpTaotlusOpingud;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusOpingudResponseDocument.VpTaotlusOpingudResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusSissetulekudDocument.VpTaotlusSissetulekud;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusSissetulekudResponseDocument.VpTaotlusSissetulekudResponse;
import java.math.BigInteger;
import org.apache.xmlbeans.XmlObject;
import org.springframework.stereotype.Service;

@Service("ehisXRoadService")
public class EhisXRoadServiceImpl extends EhisXRoadDatabaseImpl implements EhisXRoadService {

  public EeIsikukaartResponse eeIsikukaart(String personalCode, String format, String userId)
      throws XRoadServiceConsumptionException {
    EeIsikukaart request = EeIsikukaart.Factory.newInstance();
    request.setIsikukood(personalCode);
    request.setFormat(format);

    if (userId == null || userId.equalsIgnoreCase("-")) {
      return eeIsikukaartV1(request);
    }

    return eeIsikukaartV1(request, userId);
  }

  public VpTaotlusOpingudResponse vptOpingud(String personalCode, Object applicationId,
      String userId)
      throws XRoadServiceConsumptionException {
    VpTaotlusOpingud request = VpTaotlusOpingud.Factory.newInstance();
    request.setTaotlejaIsikukood(personalCode);

    if (applicationId != null) {
      request.setTaotluseId(applicationId);
    }

    if (userId == null || userId.equalsIgnoreCase("-")) {
      return vpTaotlusOpingudV1(request);
    }

    return vpTaotlusOpingudV1(request, userId);
  }

  public VpTaotlusIsikudResponse vpTaotlusIsikud(VpTaotlusIsikud request, String userId)
      throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return vpTaotlusIsikudV1(request);
    }

    return vpTaotlusIsikudV1(request, userId);
  }

  public VpTaotlusSissetulekudResponse vpTaotlusSissetulekud(VpTaotlusSissetulekud request,
      String userId) throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return vpTaotlusSissetulekudV1(request);
    }

    return vpTaotlusSissetulekudV1(request, userId);
  }

  public VpTaotlusKontaktResponse vpTaotlusKontakt(VpTaotlusKontakt request, String userId)
      throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return vpTaotlusKontaktV1(request);
    }

    return vpTaotlusKontaktV1(request, userId);
  }

  public VpTaotlusEsitamineResponse vpTaotlusEsitamine(VpTaotlusEsitamine request, String userId)
      throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return vpTaotlusEsitamineV1(request);
    }

    return vpTaotlusEsitamineV1(request, userId);
  }

  public VpTaotlusDokumentResponse vpTaotlusDokument(VpTaotlusDokument request, String userId)
      throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return vpTaotlusDokumentV1(request);
    }

    return vpTaotlusDokumentV1(request, userId);
  }

  public MtsysKlfTeenusResponse mtsysKlfTeenus(String userId)
      throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return mtsysKlfTeenusV1(XmlObject.Factory.newInstance(), userId);
    }

    return mtsysKlfTeenusV1(XmlObject.Factory.newInstance(), userId);
  }

  public MtsysTegevusloadResponse mtsysTegevusload(String identifier, String userId)
      throws XRoadServiceConsumptionException {
    MtsysTegevusload request = MtsysTegevusload.Factory.newInstance();
    request.setRegistrikood(identifier);

    if (userId == null || userId.equalsIgnoreCase("-")) {
      return mtsysTegevusloadV1(request);
    }

    return mtsysTegevusloadV1(request, userId);
  }

  public MtsysTegevuslubaResponse mtsysTegevusluba(BigInteger identifier, String userId)
      throws XRoadServiceConsumptionException {
    MtsysTegevusluba request = MtsysTegevusluba.Factory.newInstance();
    request.setTaotlusId(identifier);

    if (userId == null || userId.equalsIgnoreCase("-")) {
      return mtsysTegevuslubaV1(request);
    }

    return mtsysTegevuslubaV1(request, userId);
  }

  public MtsysLaeTegevuslubaResponse mtsysLaeTegevusluba(MtsysLaeTegevusluba request, String userId)
      throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return mtsysLaeTegevuslubaV1(request);
    }

    return mtsysLaeTegevuslubaV1(request, userId);
  }

  public MtsysEsitaTegevuslubaResponse mtsysEsitaTegevusluba(MtsysEsitaTegevusluba request,
      String userId) throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return mtsysEsitaTegevuslubaV1(request);
    }

    return mtsysEsitaTegevuslubaV1(request, userId);
  }

  public MtsysOppeasutusResponse mtsysOppeasutus(BigInteger identifier, String userId)
      throws XRoadServiceConsumptionException {
    MtsysOppeasutus request = MtsysOppeasutus.Factory.newInstance();
    request.setOppeasutusId(identifier);

    if (userId == null || userId.equalsIgnoreCase("-")) {
      return mtsysOppeasutusV1(request);
    }

    return mtsysOppeasutusV1(request, userId);
  }

  public MtsysLaeOppeasutusResponse mtsysLaeOppeasutus(MtsysLaeOppeasutus request, String userId)
      throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return mtsysLaeOppeasutusV1(request);
    }

    return mtsysLaeOppeasutusV1(request, userId);
  }
}
