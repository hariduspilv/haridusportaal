package ee.htm.portal.services.client;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import com.nortal.jroad.client.service.XRoadDatabaseService;
import ee.htm.portal.services.database.EhisXRoadDatabase;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.EeIsikukaartDocument.EeIsikukaart;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.EeIsikukaartResponseDocument.EeIsikukaartResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysKlfTeenusDocument;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysKlfTeenusResponseDocument.MtsysKlfTeenusResponse;
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
import javax.annotation.Resource;
import org.apache.xmlbeans.SchemaType;
import org.apache.xmlbeans.XmlObject;
import org.springframework.stereotype.Service;

@Service("ehisv6XTeeService")
public class EhisV6XRoadServiceImpl extends XRoadDatabaseService implements EhisV6XRoadService {

  @Resource
  private EhisXRoadDatabase ehisXRoadDatabase;

  public EeIsikukaartResponse eeIsikukaart(String personalCode, String format, String userId)
      throws XRoadServiceConsumptionException {
    EeIsikukaart request = EeIsikukaart.Factory.newInstance();
    request.setIsikukood(personalCode);
    request.setFormat(format);

    if (userId == null || userId.equalsIgnoreCase("-")) {
      return ehisXRoadDatabase.eeIsikukaartV1(request);
    }

    return ehisXRoadDatabase.eeIsikukaartV1(request, userId);
  }

  public VpTaotlusOpingudResponse vptOpingud(String personalCode, Object applicationId, String userId)
      throws XRoadServiceConsumptionException {
    VpTaotlusOpingud request = VpTaotlusOpingud.Factory.newInstance();
    request.setTaotlejaIsikukood(personalCode);

    if (applicationId != null) {
      request.setTaotluseId(applicationId);
    }

    if (userId == null || userId.equalsIgnoreCase("-")) {
      return ehisXRoadDatabase.vpTaotlusOpingudV1(request);
    }

    return ehisXRoadDatabase.vpTaotlusOpingudV1(request, userId);
  }

  public VpTaotlusIsikudResponse vpTaotlusIsikud(VpTaotlusIsikud request, String userId)
      throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return ehisXRoadDatabase.vpTaotlusIsikudV1(request);
    }

    return ehisXRoadDatabase.vpTaotlusIsikudV1(request, userId);
  }

  public VpTaotlusSissetulekudResponse vpTaotlusSissetulekud(VpTaotlusSissetulekud request,
      String userId) throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return ehisXRoadDatabase.vpTaotlusSissetulekudV1(request);
    }

    return ehisXRoadDatabase.vpTaotlusSissetulekudV1(request, userId);
  }

  public VpTaotlusKontaktResponse vpTaotlusKontakt(VpTaotlusKontakt request, String userId)
      throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return ehisXRoadDatabase.vpTaotlusKontaktV1(request);
    }

    return ehisXRoadDatabase.vpTaotlusKontaktV1(request, userId);
  }

  public VpTaotlusEsitamineResponse vpTaotlusEsitamine(VpTaotlusEsitamine request, String userId)
      throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return ehisXRoadDatabase.vpTaotlusEsitamineV1(request);
    }

    return ehisXRoadDatabase.vpTaotlusEsitamineV1(request, userId);
  }

  public VpTaotlusDokumentResponse vpTaotlusDokument(VpTaotlusDokument request, String userId)
      throws XRoadServiceConsumptionException {
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return ehisXRoadDatabase.vpTaotlusDokumentV1(request);
    }

    return ehisXRoadDatabase.vpTaotlusDokumentV1(request, userId);
  }

  public MtsysKlfTeenusResponse mtsysKlfTeenus(String userId) throws XRoadServiceConsumptionException {
    XmlObject reguest = XmlObject.Factory.newInstance();
    if (userId == null || userId.equalsIgnoreCase("-")) {
      return ehisXRoadDatabase.mtsysKlfTeenusV1(reguest, userId);
    }
    return ehisXRoadDatabase.mtsysKlfTeenusV1(reguest, userId);
  }
}
