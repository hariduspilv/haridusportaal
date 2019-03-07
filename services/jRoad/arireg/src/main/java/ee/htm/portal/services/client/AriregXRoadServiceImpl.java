package ee.htm.portal.services.client;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import ee.htm.portal.services.database.AriregXRoadDatabaseImpl;
import ee.htm.portal.services.types.eu.x_road.arireg.producer.EsindusV1;
import ee.htm.portal.services.types.eu.x_road.arireg.producer.EsindusV1Response;
import ee.htm.portal.services.types.eu.x_road.arireg.producer.ParingesindusV4Paring;
import org.springframework.stereotype.Service;

@Service("ariregXRoadService")
public class AriregXRoadServiceImpl extends AriregXRoadDatabaseImpl implements AriregXRoadService {

  public EsindusV1Response getEsindusV1(String personalCode, String countryCode, String userId)
      throws XRoadServiceConsumptionException {
    EsindusV1 request = EsindusV1.Factory.newInstance();
    ParingesindusV4Paring paring = ParingesindusV4Paring.Factory.newInstance();
    paring.setFyysiliseIsikuKood(personalCode);
    paring.setFyysiliseIsikuKoodiRiik(countryCode);
    request.setKeha(paring);

    if (userId == null || userId.equalsIgnoreCase("-")) {
      return esindusV1V1(request);
    }

    return esindusV1V1(request, userId);
  }

}
