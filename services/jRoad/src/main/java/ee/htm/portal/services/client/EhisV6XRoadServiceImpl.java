package ee.htm.portal.services.client;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import com.nortal.jroad.client.service.XRoadDatabaseService;
import ee.htm.portal.services.database.EhisXRoadDatabase;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.EeIsikukaartDocument.EeIsikukaart;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.EeIsikukaartResponseDocument.EeIsikukaartResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusOpingudResponseDocument.VpTaotlusOpingudResponse;
import javax.annotation.Resource;
import org.springframework.stereotype.Service;

@Service("ehisv6XTeeService")
public class EhisV6XRoadServiceImpl extends XRoadDatabaseService implements EhisV6XRoadService {

  @Resource
  private EhisXRoadDatabase ehisXRoadDatabase;

  public EeIsikukaartResponse eeIsikukaart(String isikukood, String format, String userId)
      throws XRoadServiceConsumptionException {
    EeIsikukaart request = EeIsikukaart.Factory.newInstance();
    request.setIsikukood(isikukood);
    request.setFormat(format);

    if (userId == null) {
      return ehisXRoadDatabase.eeIsikukaartV1(request);
    }

    return ehisXRoadDatabase.eeIsikukaartV1(request, userId);
  }

  public VpTaotlusOpingudResponse vptOpingud() throws XRoadServiceConsumptionException {

  }
}
