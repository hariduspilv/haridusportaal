package ee.htm.portal.services.client;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import ee.htm.portal.services.database.KutseregisterXRoadDatabaseImpl;
import ee.htm.portal.services.types.ee.riik.xtee.kutseregister.producers.producer.kutseregister.KodanikKutsetunnistusParingDocument.KodanikKutsetunnistusParing;
import ee.htm.portal.services.types.ee.riik.xtee.kutseregister.producers.producer.kutseregister.KodanikKutsetunnistusVastusDocument.KodanikKutsetunnistusVastus;
import org.springframework.stereotype.Service;

@Service("kutseregisterXRoadService")
public class KutseregisterXRoadServiceImpl extends KutseregisterXRoadDatabaseImpl implements
    KutseregisterXRoadService {

  public KodanikKutsetunnistusVastus kodanikKutsetunnistus(boolean invalidBoolean, String userId)
      throws XRoadServiceConsumptionException {
    KodanikKutsetunnistusParing request = KodanikKutsetunnistusParing.Factory.newInstance();
    request.setKehtetud(invalidBoolean);

    return kodanikKutsetunnistusV2(request, userId);
  }
}
